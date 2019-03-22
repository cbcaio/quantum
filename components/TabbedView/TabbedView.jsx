import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import Colors from '../Colors';
import Tab from './Tab';

const getColors = skin => {
  const skins = {
    default: {
      activeText: Colors.BLUE[500],
      background: 'transparent',
      hover: Colors.BLUE[200],
      text: 'inherit',
    },
    blue: {
      activeText: Colors.WHITE,
      background: Colors.BLUE[500],
      hover: Colors.COBALT[500],
      text: Colors.WHITE,
    },
  };

  return skins[skin] || skins.default;
};

const Navbar = styled.nav.attrs({
  role: 'tablist',
})`
  display: flex;
  flex-grow: 1;
  flex-shrink: 1;
  margin: 0 0 25px 0;
  padding: 0;
`;

Navbar.displayName = 'Navbar';

const NavItem = styled.button.attrs({
  role: 'tab',
})`
  box-sizing: border-box;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  font-size: 20px;
  height: 48px;
  line-height: 1.5;
  min-width: 90px;
  overflow: hidden;
  outline: none;
  padding: 9px 16px;
  text-align: center;
  text-transform: uppercase;

  ${({ skin, active }) => {
    const { background, text, activeText, hover } = getColors(skin);
    return css`
      background-color: ${background};
      color: ${text};

      ${active &&
        `
        border-bottom: 4px solid ${activeText};
        color: ${activeText};
        font-weight: bold;
        cursor: default;
      `}

      &:hover {
        background-color: ${hover};
      }
    `;
  }}
`;

NavItem.displayName = 'NavItem';

const RenderIf = ({ conditional, children }) => conditional && children;

class TabbedView extends React.Component {
  static Tab = Tab;

  constructor(props) {
    super(props);

    const { children, activeTab } = props;

    if (activeTab) {
      this.state = {
        activeTab,
      };
    } else {
      const [firstTab] = React.Children.toArray(children);
      const {
        props: { title },
      } = firstTab;
      this.state = {
        activeTab: title,
      };
    }
  }

  onTabClick = tab => {
    this.setState({ activeTab: tab });
  };

  render() {
    const { children, skin } = this.props;
    const { activeTab } = this.state;

    return (
      <>
        <Navbar>
          {React.Children.map(children, ({ props: { title } }) => (
            <NavItem
              key={title}
              onClick={() => this.onTabClick(title)}
              active={title === activeTab}
              skin={skin}
              id={`${title}-tab`}
              aria-controls={`${title}-panel`}
              aria-selected={title === activeTab}
            >
              {title}
            </NavItem>
          ))}
        </Navbar>

        {React.Children.map(
          children,
          ({ props: { title, children: tabContent } }) => (
            <RenderIf conditional={title === activeTab}>
              <div
                role="tabpanel"
                id={`${title}-panel`}
                aria-labelledby={`${title}-tab`}
              >
                {tabContent}
              </div>
            </RenderIf>
          ),
        )}
      </>
    );
  }
}

TabbedView.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  activeTab: PropTypes.string,
  skin: PropTypes.oneOf(['default', 'blue']),
};

TabbedView.defaultProps = {
  activeTab: undefined,
  skin: 'default',
};

TabbedView.displayName = 'TabbedView';

export default TabbedView;
