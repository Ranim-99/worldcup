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
  updateQualifier: (teams, index1, index2, round) =>
    dispatch(updateQualifier(teams, index1, index2, round)),
  removeTeam: (round, match, home) => dispatch(removeTeam(round, match, home)),
  removeChampions: (team) => dispatch(removeChampions(team)),
});

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
      return null;
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
  first: PropTypes.number.isRequired,
  second: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  updateQualifier: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
  removeTeam: PropTypes.func.isRequired,
  champions: PropTypes.object.isRequired,
  removeChampions: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(GroupTable);
