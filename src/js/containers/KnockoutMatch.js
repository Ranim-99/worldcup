import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import KnockoutGameComponent from '../components/KnockoutGameComponent';
import { updateKnockout, removeTeam, updateChampions, removeChampions, updateKnockoutScore } from '../actions/index';

import { advance, FINAL_MATCH_NUM, THIRD_PLACE_MATCH_NUM } from '../data/matchData';

const mapStateToProps = state => ({
  knockouts: state.knockouts,
  champions: state.champions,
});

const mapDispatchToProps = dispatch => ({
  updateKnockout: (teams, index1, round, home, scores) =>
    dispatch(updateKnockout(teams, index1, round, home, scores)),
  updateKnockoutScore: (round, matchIndex, score1, score2) =>
    dispatch(updateKnockoutScore(round, matchIndex, score1, score2)),
  removeTeam: (round, match, home) => dispatch(removeTeam(round, match, home)),
  updateChampions: team => dispatch(updateChampions(team)),
  removeChampions: team => dispatch(removeChampions(team)),
});

class KnockoutMatch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      homeScore: this.props.data.score1 !== null ? this.props.data.score1 : 0,
      awayScore: this.props.data.score2 !== null ? this.props.data.score2 : 0,
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.calculateResult = this.calculateResult.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.updateScores = this.updateScores.bind(this);
    this.score1Input = React.createRef();
    this.score2Input = React.createRef();
  }

  componentDidMount() {
    // Initialize with existing scores if they exist
    if (this.props.data.score1 !== null || this.props.data.score2 !== null) {
      this.setState({
        homeScore: this.props.data.score1 || 0,
        awayScore: this.props.data.score2 || 0,
      });
    }

    // If a match has an actual result then calculate which team progressed
    if (this.props.data.score1 !== null && this.props.data.score2 !== null) {
      this.calculateResult();
    }
  }

  componentDidUpdate(prevProps) {
    // Update local state if props change
    if (prevProps.data.score1 !== this.props.data.score1 ||
      prevProps.data.score2 !== this.props.data.score2) {
      this.setState({
        homeScore: this.props.data.score1 !== null ? this.props.data.score1 : 0,
        awayScore: this.props.data.score2 !== null ? this.props.data.score2 : 0,
      });
    }
  }

  updateScores(homeScore, awayScore) {
    // Update local state
    this.setState({
      homeScore: homeScore,
      awayScore: awayScore,
    }, () => {
      // First, update the scores in Redux using the dedicated score update action
      this.updateKnockoutScores(homeScore, awayScore);

      // Then calculate result if both teams exist
      if (this.props.data.team1.name && this.props.data.team2.name) {
        // Use setTimeout to ensure the Redux store is updated before calculating result
        setTimeout(() => {
          this.calculateResult();
        }, 0);
      }
    });
  }

  updateKnockoutScores(homeScore, awayScore) {
    // Find current match index in its round
    const currentRound = this.props.round - 1;
    const matchIndex = this.props.knockouts[currentRound].matches.findIndex(
      match => match.num === this.props.data.num
    );

    if (matchIndex !== -1) {
      // Use the dedicated score update action
      this.props.updateKnockoutScore(currentRound, matchIndex, homeScore, awayScore);
    }
  }

  handleInputChange(e) {
    const value = parseInt(e.target.value, 10) || 0;
    const name = e.target.name;

    if (name === 'homeScore') {
      this.updateScores(value, this.state.awayScore);
    } else if (name === 'awayScore') {
      this.updateScores(this.state.homeScore, value);
    }
  }

  handleKeyDown(e) {
    if (e.keyCode === 13) {
      this.changeScore(e);
    }
  }

  handleClick(e) {
    this.changeScore(e);
  }

  calculateResult() {
    // Only proceed if both teams exist
    if (!this.props.data.team1.name || !this.props.data.team2.name) {
      return;
    }

    // Use current state scores for calculation
    const homeScore = this.state.homeScore;
    const awayScore = this.state.awayScore;

    // Skip calculation if scores are equal (no winner determined)
    if (homeScore === awayScore) {
      return;
    }

    // Compare result by 90 mins then extra time and penalties if needed
    let result = homeScore - awayScore;
    if (result === 0) {
      result = (this.props.data.score1et || 0) - (this.props.data.score2et || 0);
      if (result === 0) {
        result = (this.props.data.score1p || 0) - (this.props.data.score2p || 0);
      }
    }

    // Only proceed if there's a clear winner
    if (result === 0) {
      return;
    }

    const team = result > 0 ? this.props.data.team1 : this.props.data.team2;
    const losingTeam = result > 0 ? this.props.data.team2 : this.props.data.team1;
    const teams = [{ name: team.name, code: team.code }];
    const num = this.props.data.num;

    // Third-place match: its winner is just 3rd place — don't route or crown.
    if (num === THIRD_PLACE_MATCH_NUM) return;

    if (num === FINAL_MATCH_NUM) {
      this.props.updateChampions(team);
      return;
    }

    // Route the winner to its next match, located by num anywhere in the tree.
    if (this.props.first != null) {
      let targetRound = -1;
      let targetIndex = -1;
      this.props.knockouts.forEach((round, r) => {
        const idx = round.matches.findIndex((m) => m.num === this.props.first);
        if (idx !== -1) { targetRound = r; targetIndex = idx; }
      });
      if (targetRound !== -1) {
        const home = 'team' + this.props.home;
        this.checkFutureRounds(losingTeam);
        this.props.updateKnockout(teams, targetIndex, targetRound, home, []);
      }
    }

    // Semifinal losers feed the third-place match (103).
    if (num === 101 || num === 102) {
      let tpRound = -1;
      let tpIndex = -1;
      this.props.knockouts.forEach((round, r) => {
        const idx = round.matches.findIndex((m) => m.num === THIRD_PLACE_MATCH_NUM);
        if (idx !== -1) { tpRound = r; tpIndex = idx; }
      });
      if (tpRound !== -1) {
        const slot = num === 101 ? 'team1' : 'team2';
        this.props.updateKnockout(
          [{ name: losingTeam.name, code: losingTeam.code }],
          tpIndex, tpRound, slot, [],
        );
      }
    }
  }

  changeScore(e) {
    // Check if user increased or decreased score
    const incOrDec = e.target.className;
    // Check using refs is the home or away team was clicked
    const id = e.currentTarget.parentNode.id;
    const ref = id === 'home' ? this.score1Input.current.value : this.score2Input.current.value;
    // If value was empty convert to 0
    const input = ref === '' ? 0 : parseInt(ref, 10);
    // Add or remove 1 and prevent negative number;
    let value = incOrDec === 'up' ? input + 1 : input - 1;
    value = value < 0 ? 0 : value;

    if (id === 'home') {
      this.updateScores(value, this.state.awayScore);
    } else {
      this.updateScores(this.state.homeScore, value);
    }
  }

  checkFutureRounds(losingTeam) {
    // Checking if the losing team was present in future rounds
    const knockouts = [...this.props.knockouts];
    const removeTeamArr = [];
    knockouts.forEach((round, i) => {
      if (i >= this.props.round) {
        round.matches.forEach((match, j) => {
          if (losingTeam.name === match.team1.name) {
            removeTeamArr.push({
              name: losingTeam.name, round: i, match: j, home: 'team1',
            });
          }
          if (losingTeam.name === match.team2.name) {
            removeTeamArr.push({
              name: losingTeam.name, round: i, match: j, home: 'team2',
            });
          }
        });
      }
    });
    /* Remove teams if they are still in future rounds but user has changed previous results */
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
        handleClick={this.handleClick}
        handleKeyDown={this.handleKeyDown}
        handleInputChange={this.handleInputChange}
        score1Input={this.score1Input}
        score2Input={this.score2Input}
        homeScore={this.state.homeScore}
        awayScore={this.state.awayScore}
      />
    </div>
  );
}
}

KnockoutMatch.propTypes = {
  knockouts: PropTypes.array.isRequired,
  updateKnockout: PropTypes.func.isRequired,
  updateKnockoutScore: PropTypes.func.isRequired,
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