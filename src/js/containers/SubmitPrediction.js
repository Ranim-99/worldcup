import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { advance } from '../data/matchData';
import ResultModal from './ResultModal';

const mapStateToProps = (state) => ({
  champions: state.champions,
  groups: state.groups,
  knockouts: state.knockouts,
  thirds: state.thirds,
});

const THIRD_SLOTS = [74, 77, 79, 80, 81, 82, 85, 87];
const STANDINGS_URL = 'https://gaming.arabhardware.net/standings';

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

class SubmitPrediction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSubmitting: false,
      isSubmitted: false,
      showResult: false,
      alreadySubmitted: false,
      error: null,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  getUserIdFromUrl() {
    return new URLSearchParams(window.location.search).get('ui');
  }

  areGroupsComplete() {
    return Object.keys(this.props.thirds || {}).length === 12;
  }

  areThirdsComplete() {
    const r32 = this.props.knockouts[0];
    if (!r32) return false;
    return THIRD_SLOTS.every((num) => {
      const m = r32.matches.find((x) => x.num === num);
      return m && m.team2 && m.team2.name;
    });
  }

  areKnockoutsComplete() {
    if (!this.props.knockouts.length) return false;
    return this.props.knockouts.every((round) =>
      round.matches.every((m) => m.team1 && m.team1.name && m.team2 && m.team2.name));
  }

  championSelected() {
    return !!(this.props.champions && this.props.champions.name);
  }

  isComplete() {
    return this.areGroupsComplete() && this.areThirdsComplete()
      && this.areKnockoutsComplete() && this.championSelected();
  }

  // All four team names of a group, from its fixtures.
  groupTeams(groupName) {
    const g = this.props.groups.find((x) => x.name === groupName);
    if (!g) return [];
    const names = [];
    g.matches.forEach((m) => {
      if (m.team1 && m.team1.name && !names.includes(m.team1.name)) names.push(m.team1.name);
      if (m.team2 && m.team2.name && !names.includes(m.team2.name)) names.push(m.team2.name);
    });
    return names;
  }

  collectPredictionData() {
    const r32 = this.props.knockouts[0];

    const groupsPayload = advance[0].matches.map((g) => {
      const letter = String.fromCharCode(65 + g.group);
      const wMatch = r32 ? r32.matches.find((m) => m.num === g.winner.num) : null;
      const rMatch = r32 ? r32.matches.find((m) => m.num === g.runnerUp.num) : null;
      const first = wMatch && wMatch[g.winner.slot] ? wMatch[g.winner.slot].name : null;
      const second = rMatch && rMatch[g.runnerUp.slot] ? rMatch[g.runnerUp.slot].name : null;
      const third = this.props.thirds[letter] ? this.props.thirds[letter].name : null;
      const fourth = this.groupTeams(`Group ${letter}`)
        .find((t) => t !== first && t !== second && t !== third) || null;
      return { group: `Group ${letter}`, first, second, third, fourth };
    });

    const knockoutsPayload = this.props.knockouts.map((round) => ({
      round: round.name,
      matches: round.matches.map((m) => ({
        num: m.num,
        team1: m.team1 ? m.team1.name : null,
        team2: m.team2 ? m.team2.name : null,
        winner: m.winnerName || null,
      })),
    }));

    return {
      id: this.getUserIdFromUrl(),
      champion: this.props.champions,
      groups: groupsPayload,
      knockouts: knockoutsPayload,
      timestamp: new Date().toISOString(),
    };
  }

  async handleSubmit() {
    if (!this.isComplete()) {
      alert('Please complete all stages first.');
      return;
    }
    const userId = this.getUserIdFromUrl();
    if (!userId) { alert('User ID is missing from the URL (?ui=yourId).'); return; }

    this.setState({ isSubmitting: true, error: null });
    try {
      const response = await fetch('https://gaming.arabhardware.net/api/v1/predict-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.collectPredictionData()),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Already submitted is not a failure — show their result instead.
        if (response.status === 400 && /already/i.test(result.message || '')) {
          this.setState({ isSubmitting: false, isSubmitted: true, showResult: true, alreadySubmitted: true });
          return;
        }
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      this.setState({ isSubmitting: false, isSubmitted: true, showResult: true });
    } catch (error) {
      this.setState({ isSubmitting: false, error: error.message });
      alert(`Error submitting prediction: ${error.message}`);
    }
  }

  render() {
    const { isSubmitting, isSubmitted, showResult, alreadySubmitted, error } = this.state;
    const userId = this.getUserIdFromUrl();
    const complete = this.isComplete();
    const champOk = this.championSelected();

    return (
      <>
        <div className="bottom-bar">
          <button type="button" onClick={() => { this.props.goToGroups(); setTimeout(() => scrollTo('sec-groups'), 50); }}>Groups</button>
<button type="button" onClick={() => { this.props.goToGroups(); setTimeout(() => scrollTo('sec-thirds'), 50); }}>Thirds</button>
<button type="button" onClick={() => { this.props.goToKnockouts(); setTimeout(() => scrollTo('sec-knockouts'), 50); }}>Knockouts</button>
          <button
            type="button"
            onClick={() => this.setState({ showResult: true })}
            disabled={!champOk}
          >
            Champion
          </button>
          <button
            type="button"
            className="bb-save"
            onClick={this.handleSubmit}
            disabled={isSubmitting || isSubmitted || !complete || !userId}
          >
            {isSubmitting ? 'Saving…' : isSubmitted ? 'Saved ✓' : 'Save'}
          </button>
        </div>

        {!complete && (
          <div className="bottom-hint">
            {!this.areGroupsComplete() ? 'Order all 12 groups'
              : !this.areThirdsComplete() ? 'Pick the 8 best third-placed teams'
                : !champOk ? 'Finish the bracket and pick a champion'
                  : 'Complete the bracket'}
          </div>
        )}
        {error && <div className="bottom-hint bottom-hint--err">Error: {error}</div>}

        <ResultModal
          open={showResult}
          onClose={() => this.setState({ showResult: false })}
          standingsUrl={STANDINGS_URL}
          alreadySubmitted={alreadySubmitted}
        />
      </>
    );
  }
}

SubmitPrediction.propTypes = {
  champions: PropTypes.object.isRequired,
  groups: PropTypes.array.isRequired,
  knockouts: PropTypes.array.isRequired,
  thirds: PropTypes.object.isRequired,
  goToGroups: PropTypes.func.isRequired,
  goToKnockouts: PropTypes.func.isRequired,
};

export default connect(mapStateToProps)(SubmitPrediction);