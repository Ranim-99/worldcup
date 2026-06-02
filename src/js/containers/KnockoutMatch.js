import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import KnockoutGameComponent from '../components/KnockoutGameComponent';
import { updateKnockout, removeTeam, updateChampions, removeChampions } from '../actions/index';
import { FINAL_MATCH_NUM, THIRD_PLACE_MATCH_NUM } from '../data/matchData';

const mapStateToProps = (state) => ({
  knockouts: state.knockouts,
  champions: state.champions,
});

const mapDispatchToProps = (dispatch) => ({
  updateKnockout: (teams, index1, round, home, scores) =>
    dispatch(updateKnockout(teams, index1, round, home, scores)),
  removeTeam: (round, match, home) => dispatch(removeTeam(round, match, home)),
  updateChampions: (team) => dispatch(updateChampions(team)),
  removeChampions: (team) => dispatch(removeChampions(team)),
});

class KnockoutMatch extends Component {
  constructor(props) {
    super(props);
    this.state = { selectedWinner: null };
    this.selectWinner = this.selectWinner.bind(this);
  }

  componentDidUpdate(prevProps) {
    // If either team in this match changed (an upstream re-pick), clear the
    // stale selection so the user re-picks with the new teams.
    const p = prevProps.data;
    const c = this.props.data;
    const t1Changed = p.team1 && c.team1 && p.team1.name !== c.team1.name;
    const t2Changed = p.team2 && c.team2 && p.team2.name !== c.team2.name;
    if (t1Changed || t2Changed) {
      this.setState({ selectedWinner: null }); // eslint-disable-line react/no-did-update-set-state
    }
  }

  findMatch(num) {
    let round = -1;
    let index = -1;
    this.props.knockouts.forEach((r, ri) => {
      const idx = r.matches.findIndex((m) => m.num === num);
      if (idx !== -1) { round = ri; index = idx; }
    });
    return { round, index };
  }

  selectWinner(slot) {
    const data = this.props.data;
    if (!data.team1 || !data.team2 || !data.team1.name || !data.team2.name) return;
    const winner = slot === 'team1' ? data.team1 : data.team2;
    const loser = slot === 'team1' ? data.team2 : data.team1;
    this.setState({ selectedWinner: slot });
    this.routeWinner(winner, loser);
  }

  routeWinner(winnerTeam, loserTeam) {
    const num = this.props.data.num;
    const teams = [{ name: winnerTeam.name, code: winnerTeam.code }];

    // Third-place match winner is just 3rd place — don't route onward.
    if (num === THIRD_PLACE_MATCH_NUM) return;

    if (num === FINAL_MATCH_NUM) {
      this.props.updateChampions(winnerTeam);
      return;
    }

    // Advance the winner to its next match (located by num).
    if (this.props.first != null) {
      const { round, index } = this.findMatch(this.props.first);
      if (round !== -1) {
        const home = 'team' + this.props.home;
        this.checkFutureRounds(loserTeam);
        this.props.updateKnockout(teams, index, round, home, []);
      }
    }

    // Semifinal losers feed the third-place match.
    if (num === 101 || num === 102) {
      const { round, index } = this.findMatch(THIRD_PLACE_MATCH_NUM);
      if (round !== -1) {
        const slot = num === 101 ? 'team1' : 'team2';
        this.props.updateKnockout(
          [{ name: loserTeam.name, code: loserTeam.code }],
          index, round, slot, [],
        );
      }
    }
  }

  checkFutureRounds(losingTeam) {
    const knockouts = [...this.props.knockouts];
    const removeTeamArr = [];
    knockouts.forEach((round, i) => {
      if (i >= this.props.round) {
        round.matches.forEach((match, j) => {
          if (match.team1 && losingTeam.name === match.team1.name) {
            removeTeamArr.push({ name: losingTeam.name, round: i, match: j, home: 'team1' });
          }
          if (match.team2 && losingTeam.name === match.team2.name) {
            removeTeamArr.push({ name: losingTeam.name, round: i, match: j, home: 'team2' });
          }
        });
      }
    });
    if (removeTeamArr.length) {
      removeTeamArr.forEach((el) => {
        this.props.removeTeam(el.round, el.match, el.home);
        if (el.name === this.props.champions.name) {
          this.props.removeChampions(el);
        }
      });
    }
  }

  render() {
    const isThirdPlace = this.props.data.num === THIRD_PLACE_MATCH_NUM;
    return (
      <div className={'knockout-match bracket-team' + (isThirdPlace ? ' third-place-match' : '')}>
        {isThirdPlace && <div className="third-place-label">Match for Third Place</div>}
        <KnockoutGameComponent
          data={this.props.data}
          selectedWinner={this.state.selectedWinner}
          onSelect={this.selectWinner}
        />
      </div>
    );
  }
}

KnockoutMatch.propTypes = {
  knockouts: PropTypes.array.isRequired,
  updateKnockout: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
  first: PropTypes.number,
  round: PropTypes.number.isRequired,
  home: PropTypes.number.isRequired,
  removeTeam: PropTypes.func.isRequired,
  champions: PropTypes.object.isRequired,
  updateChampions: PropTypes.func.isRequired,
  removeChampions: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(KnockoutMatch);