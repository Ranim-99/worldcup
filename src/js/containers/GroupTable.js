import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { updateQualifier, removeTeam, removeChampions, reportThird } from "../actions/index";
import FlagIcon from "../components/FlagIcon";
import codeConverter from "../data/flagCodes";

const mapStateToProps = (state) => ({
  groups: state.groups,
  knockouts: state.knockouts,
  champions: state.champions,
});

const mapDispatchToProps = (dispatch) => ({
  updateQualifier: (payload, round) => dispatch(updateQualifier(payload, round)),
  removeTeam: (round, match, home) => dispatch(removeTeam(round, match, home)),
  removeChampions: (team) => dispatch(removeChampions(team)),
  reportThird: (group, team) => dispatch(reportThird(group, team)),
});

// Order a group's teams per the FIFA 2026 tiebreakers:
//   1 points
//   2-4 head-to-head among tied teams: pts, GD, goals
//   5 overall GD, 6 overall goals
//   7 fair play (no card data in a predictor -> treated as 0)
//   8 drawing of lots (deterministic by name)
// Head-to-head is re-applied to any subset that remains tied, per the rules.
function rankGroup(teams, matches) {
  const miniTable = (group) => {
    const names = group.map((t) => t.name);
    const s = {};
    names.forEach((n) => { s[n] = { pts: 0, gd: 0, gf: 0 }; });
    matches.forEach((m) => {
      if (!m.team1 || !m.team2) return;
      if (m.score1 == null || m.score2 == null) return;
      const a = m.team1.name;
      const b = m.team2.name;
      if (names.indexOf(a) === -1 || names.indexOf(b) === -1) return;
      s[a].gf += m.score1; s[a].gd += m.score1 - m.score2;
      s[b].gf += m.score2; s[b].gd += m.score2 - m.score1;
      if (m.score1 > m.score2) s[a].pts += 3;
      else if (m.score2 > m.score1) s[b].pts += 3;
      else { s[a].pts += 1; s[b].pts += 1; }
    });
    return s;
  };

  const overallFallback = (group) =>
    [...group].sort((x, y) =>
      (y.gd - x.gd) ||
      (y.gf - x.gf) ||
      ((x.fair || 0) - (y.fair || 0)) ||
      x.name.localeCompare(y.name));

  const breakTies = (group) => {
    if (group.length <= 1) return group;
    const mt = miniTable(group);
    const sorted = [...group].sort((x, y) =>
      (mt[y.name].pts - mt[x.name].pts) ||
      (mt[y.name].gd - mt[x.name].gd) ||
      (mt[y.name].gf - mt[x.name].gf) || 0);

    const out = [];
    let i = 0;
    while (i < sorted.length) {
      let j = i + 1;
      while (j < sorted.length
        && mt[sorted[j].name].pts === mt[sorted[i].name].pts
        && mt[sorted[j].name].gd === mt[sorted[i].name].gd
        && mt[sorted[j].name].gf === mt[sorted[i].name].gf) j += 1;
      const tied = sorted.slice(i, j);
      if (tied.length === 1) out.push(tied[0]);
      else if (tied.length < group.length) out.push(...breakTies(tied)); // re-apply H2H
      else out.push(...overallFallback(tied));                          // H2H didn't separate
      i = j;
    }
    return out;
  };

  const byPoints = [...teams].sort((a, b) => b.pts - a.pts);
  const result = [];
  let i = 0;
  while (i < byPoints.length) {
    let j = i + 1;
    while (j < byPoints.length && byPoints[j].pts === byPoints[i].pts) j += 1;
    const tied = byPoints.slice(i, j);
    if (tied.length === 1) result.push(tied[0]);
    else result.push(...breakTies(tied));
    i = j;
  }
  return result;
}

class GroupTable extends Component {
  constructor(props) {
    super(props);
    // order: array of team names in chosen finishing order (index 0 = 1st)
    this.state = { teams: [], order: [] };
    this.placeTeam = this.placeTeam.bind(this);
    this.removeFromOrder = this.removeFromOrder.bind(this);
    this.moveUp = this.moveUp.bind(this);
    this.moveDown = this.moveDown.bind(this);
    this.autoOrder = this.autoOrder.bind(this);
    this.reset = this.reset.bind(this);
  }

  componentDidMount() {
    this.initializeTeams();
  }

  componentDidUpdate(prevProps) {
    if (this.props.data !== prevProps.data) {
      this.initializeTeams();
    }
  }

  initializeTeams() {
    const teams = [];
    this.props.data.matches.forEach((el) => {
      if (el.team1.name && teams.findIndex((x) => x.name === el.team1.name) === -1) {
        teams.push({ name: el.team1.name, code: el.team1.code });
      }
      if (el.team2.name && teams.findIndex((x) => x.name === el.team2.name) === -1) {
        teams.push({ name: el.team2.name, code: el.team2.code });
      }
    });
    this.setState({ teams });
  }

  placeTeam(name) {
    this.setState((prev) => {
      if (prev.order.includes(name) || prev.order.length >= 4) return null;
      const order = [...prev.order, name];
      // Once 3 are placed, auto-drop the only remaining team into 4th.
      if (order.length === 3) {
        const last = prev.teams.find((t) => !order.includes(t.name));
        if (last) order.push(last.name);
      }
      return { order };
    }, this.applySelections);
  }

  removeFromOrder(index) {
    this.setState((prev) => {
      const order = [...prev.order];
      order.splice(index, 1);
      return { order };
    }, this.applySelections);
  }

  moveUp(index) {
    if (index === 0) return;
    this.setState((prev) => {
      const order = [...prev.order];
      [order[index - 1], order[index]] = [order[index], order[index - 1]];
      return { order };
    }, this.applySelections);
  }

  moveDown(index) {
    this.setState((prev) => {
      if (index >= prev.order.length - 1) return null;
      const order = [...prev.order];
      [order[index + 1], order[index]] = [order[index], order[index + 1]];
      return { order };
    }, this.applySelections);
  }

  autoOrder() {
    this.setState(
      (prev) => ({ order: prev.teams.map((t) => t.name) }),
      this.applySelections,
    );
  }

  reset() {
    this.setState({ order: [] }, this.applySelections);
  }

  // Push current order into the bracket + thirds pool.
  applySelections() {
    const { order, teams } = this.state;
    const { winner, runnerUp } = this.props;
    const r32 = this.props.knockouts[0];
    if (!r32) return;

    const findIdx = (num) => r32.matches.findIndex((m) => m.num === num);
    const teamObj = (name) => teams.find((t) => t.name === name) || null;

    const first = teamObj(order[0]);
    const second = teamObj(order[1]);
    const third = teamObj(order[2]);

    this.props.updateQualifier(
      [
        {
          index: findIdx(winner.num), slot: winner.slot,
          team: first ? { name: first.name, code: first.code } : { name: null, code: null },
        },
        {
          index: findIdx(runnerUp.num), slot: runnerUp.slot,
          team: second ? { name: second.name, code: second.code } : { name: null, code: null },
        },
      ],
      0,
    );

    const groupLetter = this.props.name.slice(-1).toUpperCase();
    this.props.reportThird(
      groupLetter,
      third ? { name: third.name, code: third.code } : null,
    );

    this.checkFutureGames();
  }

  // Strip teams no longer in the top two out of later knockout rounds.
  checkFutureGames() {
    const { order, teams } = this.state;
    const advancing = [order[0], order[1]].filter(Boolean);
    const stillIn = teams.filter((t) => !advancing.includes(t.name)).map((t) => t.name);

    const knockouts = [...this.props.knockouts].slice(1);
    const removeArr = [];
    stillIn.forEach((name) => {
      knockouts.forEach((round, i) => {
        round.matches.forEach((match, j) => {
          if (match.team1 && match.team1.name === name) removeArr.push({ name, round: i + 1, match: j, home: "team1" });
          if (match.team2 && match.team2.name === name) removeArr.push({ name, round: i + 1, match: j, home: "team2" });
        });
      });
    });
    removeArr.forEach((el) => {
      if (!this.props.knockouts[el.round].matches[el.match].confirmed) {
        this.props.removeTeam(el.round, el.match, el.home);
      }
      if (el.name === this.props.champions.name) {
        this.props.removeChampions(this.props.champions);
      }
    });
  }

  render() {
    const { teams, order } = this.state;
    const posOf = (name) => order.indexOf(name);

    return (
      <div className="gp-card">
        <div className="gp-header">
          <span className="gp-title">{this.props.name.toUpperCase()}</span>
        </div>

        <div className="gp-tiles">
          {teams.map((team) => {
            const pos = posOf(team.name);
            return (
              <button
                key={team.name}
                type="button"
                className={"gp-tile" + (pos !== -1 ? " gp-tile--placed" : "")}
                onClick={() => (pos !== -1 ? this.removeFromOrder(pos) : this.placeTeam(team.name))}
                title={team.name}
              >
                {pos !== -1 && <span className="gp-tile-badge">{pos + 1}</span>}
                <FlagIcon code={codeConverter(team.code)} size="2x" />
                <span className="gp-tile-name">{team.name}</span>
              </button>
            );
          })}
        </div>

        <div className="gp-slots">
          {[0, 1, 2, 3].map((i) => {
            const name = order[i];
            const team = teams.find((t) => t.name === name);
            return (
              <div className="gp-slot" key={i}>
                <span className="gp-slot-num">{i + 1}</span>
                {team ? (
                  <div className="gp-slot-team">
                    <FlagIcon code={codeConverter(team.code)} size="2x" />
                    <span className="gp-slot-name">{team.name}</span>
                  </div>
                ) : (
                  <span className="gp-slot-empty">-</span>
                )}
                {team && (
                  <span className="gp-slot-ctrls">
                    <button type="button" onClick={() => this.moveUp(i)} disabled={i === 0}>▲</button>
                    <button type="button" onClick={() => this.moveDown(i)} disabled={i >= order.length - 1}>▼</button>
                    <button type="button" onClick={() => this.removeFromOrder(i)}>✕</button>
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="gp-actions">
          <button type="button" className="gp-btn" onClick={this.reset} title="Reset">↺</button>
          <button type="button" className="gp-btn gp-btn--auto" onClick={this.autoOrder} title="Auto order">✦</button>
        </div>
      </div>
    );
  }
}

GroupTable.propTypes = {
  knockouts: PropTypes.array.isRequired,
  name: PropTypes.string.isRequired,
  winner: PropTypes.object.isRequired,
  runnerUp: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  updateQualifier: PropTypes.func.isRequired,
  removeTeam: PropTypes.func.isRequired,
  champions: PropTypes.object.isRequired,
  removeChampions: PropTypes.func.isRequired,
  reportThird: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(GroupTable);