import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import GroupTable from "./GroupTable";
import GroupGames from "./GroupGames";
import Knockout from "./Knockout";
import KnockoutMatch from "./KnockoutMatch";
import Header from "../components/Header";

import { fetchData, fetchPredictor } from "../actions/index";
import { advance } from "../data/matchData";
import { API2014, API2018, API2026 } from "../constants/api";
import SubmitPrediction from "./SubmitPrediction";

const mapStateToProps = (state) => ({
  groups: state.groups,
  knockouts: state.knockouts,
  loadingError: state.loadingError,
  isLoading: state.loadingData,
});

const mapDispatchToProps = (dispatch) => ({
  fetchData: (url) => dispatch(fetchData(url)),
  fetchPredictor: (url) => dispatch(fetchPredictor(url)),
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      knockout: false,
      showInfo: true,
      year: "2026",
    };
    this.toggleRound = this.toggleRound.bind(this);
    this.handleYearChange = this.handleYearChange.bind(this);
    this.handleYearSubmit = this.handleYearSubmit.bind(this);
    this.closeInfo = this.closeInfo.bind(this);
    this.keyDownCloseInfo = this.keyDownCloseInfo.bind(this);
    this.keyDownToggle = this.keyDownToggle.bind(this);
  }

  componentDidMount() {
    this.props.fetchPredictor(API2026);
  }

  keyDownToggle(e) {
    if (e.keyCode === 13) this.toggleRound(e);
  }

  toggleRound(e) {
    const toggle = e.target.id === "knockoutToggle";
    this.setState({
      knockout: toggle,
    });
  }

  handleYearChange(e) {
    this.setState({ year: e.target.value });
  }

  handleYearSubmit(e) {
    e.preventDefault();
    if (this.state.year === "2014 Results") {
      this.props.fetchData(API2026);
    } else if (this.state.year === "2018 Results") {
      this.props.fetchData(API2026);
      this.props.fetchData(API2026);
    } else if (this.state.year === "2018 Predictor") {
      this.props.fetchPredictor("https://raw.githubusercontent.com/SamehBilal/fcwc/main/public/worldcup2.json");
    }
  }

  keyDownCloseInfo(e) {
    if (e.keyCode === 13) this.closeInfo();
  }

  closeInfo() {
    this.setState({
      showInfo: false,
    });
  }

  renderGroups() {
    // Sort Group Links
    const links = this.props.groups.map((el) => {
      const letter = el.name[el.name.length - 1].toLowerCase();
      return (
        <a key={el.name} href={"#group-" + letter}>
          {letter.toUpperCase()}
        </a>
      );
    });

    // Map groups games to component
    const groups = this.props.groups.map((el, i) => {
      const games = el.matches.map((data, j) => (
        <GroupGames data={data} key={data.num} group={i} index={j} />
      ));
      // Find which match the groups winners and runners up will play in the 'Last 16'
      let routing;
      advance[0].matches.forEach((a) => { if (a.group === i) routing = a; });
      return (
        <div
          key={el.name}
          id={"group-" + el.name[el.name.length - 1].toLowerCase()}
          className="group"
        >
          <GroupTable
            key={el.name}
            name={el.name}
            winner={routing.winner}
            runnerUp={routing.runnerUp}
            data={el}
            index={i}
          />
          {games}
        </div>
      );
    });

    return (
      <div className="group-container">
        <div className="links">
          <div>Go to Group:</div>
          <div className="link-container">{links}</div>
        </div>
        <div className="group-stage">{groups}</div>
      </div>
    );
  }

  renderKnockouts() {
    const knockoutGames = this.props.knockouts;
    // Map the game the winner of each match will play in the first variable
    const knockoutList = knockoutGames.map((round, i) =>
      round.matches.map((el, j) => {
  const routeEntry = advance[i + 1].matches.find((a) => a.from === el.num);
  const first = routeEntry ? routeEntry.num : null;
  const home = routeEntry ? routeEntry.index : 0;
  return (
    <KnockoutMatch
      key={el.num != null ? el.num : `r${i}-${j}`}
      round={i + 1}
      first={first}
      home={home + 1}
      data={el}
    />
  );
})
    );

    const knockoutRounds = knockoutList.map((el, i) => (
      <Knockout
        key={"round" + i}
        data={el}
        round={i}
        name={this.props.knockouts[i] ? this.props.knockouts[i].name : ''}
      />
    ));

    return <div className="knockout-container">{knockoutRounds}</div>;
  }

  render() {
    if (this.props.loadingError) {
      return <p>Sorry! There was an error loading the data</p>;
    }
    if (this.props.isLoading) {
      return (
        <div className="loader">
          <div />
        </div>
      );
    }

    const displayStage = !this.state.knockout
      ? this.renderGroups()
      : this.renderKnockouts();

    return (
      <div className="app">
        <Header
          showInfo={this.state.showInfo}
          closeInfo={this.closeInfo}
          knockout={this.state.knockout}
          toggleRound={this.toggleRound}
          handleYearChange={this.handleYearChange}
          handleYearSubmit={this.handleYearSubmit}
          year={this.state.year}
          keyDownToggle={this.keyDownToggle}
          keyDownCloseInfo={this.keyDownCloseInfo}
        />
        <div className="container">{displayStage}
          <SubmitPrediction />
        </div>
      </div>
    );
  }
}

App.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  loadingError: PropTypes.bool.isRequired,
  groups: PropTypes.array.isRequired,
  knockouts: PropTypes.array.isRequired,
  fetchData: PropTypes.func.isRequired,
  fetchPredictor: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
