import React from 'react';
import PropTypes from 'prop-types';
import FlagIcon from '../components/FlagIcon';
import codeConverter from '../data/flagCodes';
import dateFormater from '../helpers/dateFormater';

const KnockoutGameComponent = (props) => {
  const { data, selectedWinner, onSelect } = props;
  const t1 = data.team1 || { name: null, code: null, position: '' };
  const t2 = data.team2 || { name: null, code: null, position: '' };

  const renderTeam = (team, slot) => {
    const hasTeam = team.name !== null;
    const isWinner = selectedWinner === slot;
    return (
      <div
        role="button"
        tabIndex={0}
        className={'knockout-team' + (isWinner ? ' knockout-team--winner' : '')}
        onClick={() => { if (hasTeam) onSelect(slot); }}
        onKeyDown={(e) => { if (e.keyCode === 13 && hasTeam) onSelect(slot); }}
      >
        <div>
          {hasTeam ? <FlagIcon code={codeConverter(team.code)} size="2x" /> : ''}
          <div className="knockout-country-name">{hasTeam ? team.name : team.position}</div>
          {isWinner ? <span className="knockout-check">✓</span> : ''}
        </div>
      </div>
    );
  };

  const stadium = data.stadium ? data.stadium.name : '';

  return (
    <div>
      <div className="knockout-date">{data.date ? dateFormater(data.date) : ''}</div>
      <div className="knockout-teams">
        {renderTeam(t1, 'team1')}
        {renderTeam(t2, 'team2')}
      </div>
      <div className="knockout-stadium">{stadium}</div>
      {/* <div className="knockout-location">{data.city}</div> */}
    </div>
  );
};

KnockoutGameComponent.propTypes = {
  data: PropTypes.object.isRequired,
  selectedWinner: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};

export default KnockoutGameComponent;