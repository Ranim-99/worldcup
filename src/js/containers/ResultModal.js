import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import html2canvas from 'html2canvas';

import { advance, FINAL_MATCH_NUM, THIRD_PLACE_MATCH_NUM } from '../data/matchData';
import FlagIcon from '../components/FlagIcon';
import codeConverter from '../data/flagCodes';

const mapStateToProps = (state) => ({
  champions: state.champions,
  knockouts: state.knockouts,
});

class ResultModal extends Component {
  constructor(props) {
    super(props);
    this.cardRef = React.createRef();
    this.download = this.download.bind(this);
  }

  // Find a knockout match by num across rounds.
  findMatch(num) {
    let found = null;
    this.props.knockouts.forEach((r) => {
      const m = r.matches.find((x) => x.num === num);
      if (m) found = m;
    });
    return found;
  }

  // Runner-up = the team in the Final that ISN'T the champion.
  getRunnerUp() {
    const final = this.findMatch(FINAL_MATCH_NUM);
    if (!final || !final.team1 || !final.team2) return null;
    const champ = this.props.champions.name;
    if (final.team1.name === champ) return final.team2;
    if (final.team2.name === champ) return final.team1;
    return null;
  }

  // Third place = winner of match 103. We don't store its winner explicitly,
  // so we read it from wherever the user's pick landed: the 3rd-place match
  // stores both losers; the WINNER is marked by KnockoutMatch via champions?
  // Instead we infer from the match's own selected winner if present.
  getThirdPlace() {
    const tp = this.findMatch(THIRD_PLACE_MATCH_NUM);
    if (!tp) return null;
    // KnockoutMatch stores the chosen winner on the match as `winnerName`
    // if you set it; otherwise fall back to team1.
    if (tp.winnerName) {
      return tp.team1 && tp.team1.name === tp.winnerName ? tp.team1 : tp.team2;
    }
    return null;
  }

  async download() {
    if (!this.cardRef.current) return;
    try {
      const canvas = await html2canvas(this.cardRef.current, {
        backgroundColor: '#16235e',
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = 'world-cup-2026-prediction.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      alert('Could not generate image. Flag images may block capture (CORS).');
    }
  }

  render() {
    if (!this.props.open) return null;

    const champ = this.props.champions;
    const runnerUp = this.getRunnerUp();
    const third = this.getThirdPlace();

    const podium = [
      { rank: '🥇', label: 'Champion', team: champ },
      { rank: '🥈', label: 'Runner-up', team: runnerUp },
      { rank: '🥉', label: 'Third Place', team: third },
    ];

    return (
      <div className="rm-overlay" onClick={this.props.onClose}>
        <div className="rm-modal" onClick={(e) => e.stopPropagation()}>
          <button className="rm-close" onClick={this.props.onClose}>✕</button>

          {/* This block is what gets captured as the image */}
          <div className="rm-card" ref={this.cardRef}>
            <div className="rm-card-header">FIFA World Cup 2026</div>
            <div className="rm-card-sub">My Prediction</div>

            <div className="rm-podium">
              {podium.map((p) => (
                <div className="rm-podium-row" key={p.label}>
                  <span className="rm-rank">{p.rank}</span>
                  <span className="rm-flag">
                    {p.team && p.team.code
                      ? <FlagIcon code={codeConverter(p.team.code)} size="3x" />
                      : null}
                  </span>
                  <span className="rm-team">
                    <span className="rm-label">{p.label}</span>
                    <span className="rm-name">{p.team ? p.team.name : '—'}</span>
                  </span>
                </div>
              ))}
            </div>

            <div className="rm-thanks">
              Thanks for playing! 🎉<br />
              Good luck — check the standings to see how your picks do.
            </div>
          </div>

          <div className="rm-actions">
            <button className="rm-btn rm-btn--primary" onClick={this.download}>
              Download as Image
            </button>
            {this.props.standingsUrl && (
              <a className="rm-btn" href={this.props.standingsUrl}>
                View Standings
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }
}

ResultModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  champions: PropTypes.object.isRequired,
  knockouts: PropTypes.array.isRequired,
  standingsUrl: PropTypes.string,
  alreadySubmitted: PropTypes.bool,
};

export default connect(mapStateToProps)(ResultModal);