import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { updateKnockout } from "../actions/index";
import { allocateThirds } from "../data/thirdPlaceAllocation";
import FlagIcon from "../components/FlagIcon";
import codeConverter from "../data/flagCodes";

const mapStateToProps = (state) => ({
  thirds: state.thirds,        // { A: {name, code}, B: {...}, ... } reported by groups
  knockouts: state.knockouts,
});

const mapDispatchToProps = (dispatch) => ({
  updateKnockout: (teams, index, round, slot, scores) =>
    dispatch(updateKnockout(teams, index, round, slot, scores)),
});

// The eight R32 matches whose team2 slot is a third-placed team.
const THIRD_SLOT_MATCHES = [74, 77, 79, 80, 81, 82, 85, 87];

class ThirdPlacePicker extends Component {

  componentDidMount() {
    this.hydrateFromStore();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.knockouts !== this.props.knockouts) this.hydrateFromStore();
  }

  hydrateFromStore() {
    const r32 = this.props.knockouts[0];
    if (!r32) return;
    // For each filled third-slot, find which group's 3rd is sitting there.
    const filledNames = THIRD_SLOT_MATCHES
      .map((num) => {
        const m = r32.matches.find((x) => x.num === num);
        return m && m.team2 && m.team2.name ? m.team2.name : null;
      })
      .filter(Boolean);

    const selected = Object.keys(this.props.thirds).filter((letter) =>
      filledNames.includes(this.props.thirds[letter].name));

    if (selected.sort().join('') !== [...this.state.selected].sort().join('')) {
      this.setState({ selected });
    }
  }

  constructor(props) {
    super(props);
    this.state = { selected: [] }; // array of group letters, max 8
    this.toggle = this.toggle.bind(this);
  }

  // Locate an R32 match by num across the knockout rounds.
  findMatch(num) {
    let round = -1;
    let index = -1;
    this.props.knockouts.forEach((r, ri) => {
      const idx = r.matches.findIndex((m) => m.num === num);
      if (idx !== -1) { round = ri; index = idx; }
    });
    return { round, index };
  }

  clearSlots() {
    THIRD_SLOT_MATCHES.forEach((num) => {
      const { round, index } = this.findMatch(num);
      if (round !== -1) {
        this.props.updateKnockout([{ name: null, code: null }], index, round, "team2", []);
      }
    });
  }

  applyAllocation(selectedGroups) {
    this.clearSlots();
    if (selectedGroups.length !== 8) return;

    const fills = allocateThirds(selectedGroups); // Annex C lookup
    if (!fills) return;

    fills.forEach((f) => {
      const team = this.props.thirds[f.thirdGroup];
      if (!team) return;
      const { round, index } = this.findMatch(f.matchNum);
      if (round !== -1) {
        this.props.updateKnockout(
          [{ name: team.name, code: team.code }],
          index, round, f.slot, [],
        );
      }
    });
  }

  toggle(letter) {
    this.setState((prev) => {
      let selected;
      if (prev.selected.includes(letter)) {
        selected = prev.selected.filter((l) => l !== letter);
      } else if (prev.selected.length < 8) {
        selected = [...prev.selected, letter];
      } else {
        return null; // already 8 picked
      }
      return { selected };
    }, () => this.applyAllocation(this.state.selected));
  }

  render() {
    const { thirds } = this.props;
    const { selected } = this.state;
    const groups = Object.keys(thirds).sort(); // letters that have a 3rd reported

    if (groups.length < 12) {
      return (
        <div className="tp-card">
          <h2 className="tp-title">Best Third-Placed Teams</h2>
          <p className="tp-hint">
            Pick the finishing order in all 12 groups first. ({groups.length}/12 set)
          </p>
        </div>
      );
    }

    return (
      <div className="tp-card">
        <h2 className="tp-title">Best Third-Placed Teams</h2>
        <p className="tp-hint">Select the 8 that qualify ({selected.length}/8)</p>
        <div className="tp-grid">
          {groups.map((letter) => {
            const team = thirds[letter];
            const pickIndex = selected.indexOf(letter);
            const on = pickIndex !== -1;
            const disabled = !on && selected.length >= 8;
            return (
              <button
                key={letter}
                type="button"
                className={"tp-row" + (on ? " tp-row--on" : "")}
                onClick={() => this.toggle(letter)}
                disabled={disabled}
              >
                <span className="tp-rank">{on ? pickIndex + 1 : ""}</span>
                <span className="tp-group">3{letter}</span>
                <FlagIcon code={codeConverter(team.code)} size="2x" />
                <span className="tp-name">{team.name}</span>
                <span className="tp-check">{on ? "✓" : ""}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }
}

ThirdPlacePicker.propTypes = {
  thirds: PropTypes.object.isRequired,
  knockouts: PropTypes.array.isRequired,
  updateKnockout: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(ThirdPlacePicker);