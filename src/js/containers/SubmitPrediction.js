// SubmitPrediction.js
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const mapStateToProps = (state) => ({
  champions: state.champions,
  groups: state.groups,
  knockouts: state.knockouts,
});

class SubmitPrediction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSubmitting: false,
      isSubmitted: false,
      error: null,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // Extract ID from URL search parameters
  getUserIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ui');
  }

  // Check if prediction is complete (all group matches + champion)
  isPredictionComplete() {
    // Check if all group matches have scores
    const allGroupMatchesComplete = this.props.groups.every(group =>
      group.matches.every(match => 
        match.score1 !== null && match.score2 !== null
      )
    );

    // Check if knockout prediction is complete (has champion)
    const knockoutComplete = this.props.champions && this.props.champions.name;

    return allGroupMatchesComplete && knockoutComplete;
  }

  // Check if only groups are complete (for partial submission option)
  areGroupsComplete() {
    return this.props.groups.every(group =>
      group.matches.every(match => 
        match.score1 !== null && match.score2 !== null
      )
    );
  }

  // Check completion status for display
  getCompletionStatus() {
    const groupsComplete = this.areGroupsComplete();
    const knockoutComplete = this.props.champions && this.props.champions.name;
    
    if (groupsComplete && knockoutComplete) {
      return { status: 'complete', message: 'All predictions complete!' };
    } else if (groupsComplete && !knockoutComplete) {
      return { status: 'partial', message: 'Group stage complete - finish knockout predictions!' };
    } else {
      return { status: 'incomplete', message: 'Complete group stage predictions first' };
    }
  }

  // Collect all prediction data including user ID
  collectPredictionData() {
    const userId = this.getUserIdFromUrl();
    
    const predictionData = {
      id: userId,
      champion: this.props.champions,
      groups: this.props.groups.map(group => ({
        name: group.name,
        matches: group.matches.map(match => ({
          team1: match.team1.name,
          team2: match.team2.name,
          score1: match.score1,
          score2: match.score2,
        }))
      })),
      knockouts: this.props.knockouts.map((round, roundIndex) => ({
        round: roundIndex,
        matches: round.matches.map(match => ({
          team1: match.team1.name,
          team2: match.team2.name,
          score1: match.score1,
          score2: match.score2,
          num: match.num,
        }))
      })),
      timestamp: new Date().toISOString(),
    };

    return predictionData;
  }

  async handleSubmit() {
    const completionStatus = this.getCompletionStatus();
    
    if (completionStatus.status !== 'complete') {
      alert(`Please complete all predictions! ${completionStatus.message}`);
      return;
    }

    // Check if user ID exists in URL
    const userId = this.getUserIdFromUrl();
    if (!userId) {
      alert('User ID is missing from the URL. Please make sure you accessed this page with a valid user ID parameter (?ui=yourId)');
      return;
    }

    this.setState({ isSubmitting: true, error: null });

    try {
      const predictionData = this.collectPredictionData();
      
      // Log to console as requested
      console.log('Submitting prediction data:', predictionData);

      const response = await fetch('https://gaming.arabhardware.net/api/v1/predict-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(predictionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Prediction submitted successfully:', result);
      
      this.setState({ 
        isSubmitting: false, 
        isSubmitted: true 
      });

      // Optional: Show success message
      alert('Prediction submitted successfully!');

    } catch (error) {
      console.error('Error submitting prediction:', error);
      this.setState({ 
        isSubmitting: false, 
        error: error.message 
      });
      alert(`Error submitting prediction: ${error.message}`);
    }
  }

  render() {
    const { isSubmitting, isSubmitted, error } = this.state;
    const completionStatus = this.getCompletionStatus();
    const userId = this.getUserIdFromUrl();
    
    return (
      <div className="submit-prediction-container">
        <div className="prediction-status">
          {/* <h3>Prediction Status</h3> */}
          <div className={`status-indicator ${completionStatus.status}`}>
            {completionStatus.status === 'complete' && '✅'}
            {completionStatus.status === 'partial' && '⚠️'}
            {completionStatus.status === 'incomplete' && '❌'}
            <span>{completionStatus.message}</span>
          </div>
          
          {/* Display user ID if available */}
          {/* {userId && (
            <div className="user-id-display">
              <small>User ID: {userId}</small>
            </div>
          )} */}
          
          {/* Warning if no user ID */}
          {!userId && (
            <div className="user-id-warning">
              <small style={{ color: '#dc3545' }}>
                ⚠️ No user ID found in URL. Please access this page with ?ui=yourId parameter.
              </small>
            </div>
          )}
        </div>

        {/* Show champion if selected */}
        {this.props.champions && this.props.champions.name && (
          <div className="champion-display">
            <h3>🏆 Your Predicted Champion: {this.props.champions.name}</h3>
          </div>
        )}

        {/* Show progress indicators */}
        <div className="progress-indicators">
          <div className={`progress-item ${this.areGroupsComplete() ? 'complete' : 'incomplete'}`}>
            <span className="progress-icon">{this.areGroupsComplete() ? '✅' : '⭕'}</span>
            <span>Group Stage Predictions</span>
          </div>
          <div className={`progress-item ${this.props.champions && this.props.champions.name ? 'complete' : 'incomplete'}`}>
            <span className="progress-icon">{this.props.champions && this.props.champions.name ? '✅' : '⭕'}</span>
            <span>Knockout Stage Predictions</span>
          </div>
        </div>
        
        <button
          className={`submit-prediction-btn ${isSubmitting ? 'loading' : ''} ${isSubmitted ? 'submitted' : ''} ${(completionStatus.status !== 'complete' || !userId) ? 'disabled' : ''}`}
          onClick={this.handleSubmit}
          disabled={isSubmitting || isSubmitted || completionStatus.status !== 'complete' || !userId}
        >
          {isSubmitting ? (
            <>
              <span className="spinner"></span>
              Submitting Prediction...
            </>
          ) : isSubmitted ? (
            '✓ Prediction Submitted!'
          ) : !userId ? (
            'Missing User ID in URL'
          ) : completionStatus.status === 'complete' ? (
            'Submit My Complete Prediction'
          ) : (
            `Complete ${completionStatus.status === 'incomplete' ? 'Group Stage' : 'Knockout Stage'} First`
          )}
        </button>

        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}
      </div>
    );
  }
}

SubmitPrediction.propTypes = {
  champions: PropTypes.object.isRequired,
  groups: PropTypes.array.isRequired,
  knockouts: PropTypes.array.isRequired,
};

export default connect(mapStateToProps)(SubmitPrediction);