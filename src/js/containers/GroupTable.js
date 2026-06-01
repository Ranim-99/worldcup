import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { updateQualifier, removeTeam, removeChampions, reportThird } from "../actions/index";
import GroupTableComponent from "../components/GroupTableComponent";

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
    this.state = { teams: [] };
    this.calculateTable = this.calculateTable.bind(this);
  }

  componentDidMount() {
    this.initializeTable();
  }

  componentDidUpdate(prevProps) {
    if (this.props.data !== prevProps.data) {
      this.initializeTable();
    }
  }

  initializeTable() {
    const teams = [];
    const group = this.props.data;
    group.matches
      .map((el) => [el.team1.name, el.team1.code])
      .map((el) => ({
        name: el[0], code: el[1],
        won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0,
      }))
      .filter((el) => {
        const i = teams.findIndex((x) => x.name === el.name);
        if (i <= -1) teams.push(el);
        return null;
      });

    this.setState({ teams }, () => this.calculateTable());
  }

  calculateTable() {
    const group = this.props.data;
    const teams = [...this.state.teams];

    group.matches.forEach((match) => {
      let homeTeam;
      let awayTeam;
      teams.forEach((team) => {
        if (team.name === match.team1.name) homeTeam = team;
        if (team.name === match.team2.name) awayTeam = team;
      });

      // Skip unplayed / unpredicted matches.
      if (match.score1 === null || match.score2 === null) return;
      if (!homeTeam || !awayTeam) return;

      // ACCUMULATE goals across all matches (the original overwrote them,
      // which broke "goals scored" for tiebreakers).
      homeTeam.gf += match.score1;
      homeTeam.ga += match.score2;
      awayTeam.gf += match.score2;
      awayTeam.ga += match.score1;

      const result = match.score1 - match.score2;
      if (result > 0) {
        homeTeam.won += 1; homeTeam.gd += result; homeTeam.pts += 3;
        awayTeam.lost += 1; awayTeam.gd -= result;
      } else if (result < 0) {
        awayTeam.won += 1; awayTeam.gd -= result; awayTeam.pts += 3;
        homeTeam.lost += 1; homeTeam.gd += result;
      } else {
        homeTeam.drawn += 1; homeTeam.pts += 1;
        awayTeam.drawn += 1; awayTeam.pts += 1;
      }
    });

    // Sort: points, then goal difference, then goals scored.
    const sortedTeams = teams.sort((a, b) => (a.gf < b.gf ? 1 : -1));
    sortedTeams.sort((a, b) => (a.gd < b.gd ? 1 : -1));
    sortedTeams.sort((a, b) => (a.pts < b.pts ? 1 : -1));

    this.setState({ teams: sortedTeams }, () => {
      this.calculateQualifiers();
      this.reportThirdPlace();
    });
  }

  checkFutureGames() {
    const teams = [...this.state.teams];
    const knockouts = [...this.props.knockouts].slice(1);
    const removeTeamArr = [];
    teams.forEach((team) => {
      knockouts.forEach((round, i) => {
        round.matches.forEach((match, j) => {
          if (team.name === match.team1.name) {
            removeTeamArr.push({ name: team.name, round: i + 1, match: j, home: "team1" });
          }
          if (team.name === match.team2.name) {
            removeTeamArr.push({ name: team.name, round: i + 1, match: j, home: "team2" });
          }
        });
      });
    });
    if (removeTeamArr.length) {
      removeTeamArr.forEach((el) => {
        if (!this.props.knockouts[el.round].matches[el.match].confirmed) {
          this.props.removeTeam(el.round, el.match, el.home);
        }
        if (el.name === this.props.champions.name) {
          this.props.removeChampions(this.props.champions);
        }
      });
    }
  }

  calculateQualifiers() {
    const { teams } = this.state;
    const { winner, runnerUp } = this.props;
    const r32 = this.props.knockouts[0];
    if (!r32 || !teams[0] || !teams[1]) return;

    const findIdx = (num) => r32.matches.findIndex((m) => m.num === num);

    this.props.updateQualifier(
      [
        { index: findIdx(winner.num), slot: winner.slot, team: { name: teams[0].name, code: teams[0].code } },
        { index: findIdx(runnerUp.num), slot: runnerUp.slot, team: { name: teams[1].name, code: teams[1].code } },
      ],
      0,
    );

    this.checkFutureGames();
  }

  reportThirdPlace() {
    const groupLetter = this.props.name.slice(-1).toUpperCase(); // "Group A" -> "A"
    const t = this.state.teams[2];
    this.props.reportThird(
      groupLetter,
      t ? { name: t.name, code: t.code, pts: t.pts, gd: t.gd, gf: t.gf } : null,
    );
  }

  render() {
    return (
      <div>
        <GroupTableComponent teams={this.state.teams} name={this.props.name} />
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