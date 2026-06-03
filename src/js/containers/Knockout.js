import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Champions from '../components/Champions';

const mapStateToProps = state => ({
  champions: state.champions,
});

const Knockout = (props) => {
  const displayChampions = (
    props.champions.name !== null && props.round === 4 ?
      <Champions team={props.champions} /> : ''
  );
  return (
    <div className="knockout-stage">
      <h2>{props.name}</h2>
      <div className={'knockout-round-container bracket-' + (props.round + 1)}>
        {displayChampions}
        {props.data}
      </div>
    </div>
  );
};

Knockout.propTypes = {
  data: PropTypes.array.isRequired,
  round: PropTypes.number.isRequired,
  name: PropTypes.string,
  champions: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, null)(Knockout);