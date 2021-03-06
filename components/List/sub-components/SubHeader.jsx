import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Description = styled.span`
  font-size: 12px;
`;

Description.displayName = 'SubHeader';

const SubHeader = ({ children }) => <Description>{children}</Description>;

SubHeader.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

SubHeader.displayName = 'List.SubHeader';

export default SubHeader;
