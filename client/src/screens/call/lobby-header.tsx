import { forwardRef } from "react";

import { Link } from "@tanstack/react-router";

import { useSettings } from "@/screens/call/context/settings-context";
import { LanguageMenu } from "./settings/language-menu";

import { Icon, MenuToggle } from "@stream-io/video-react-sdk";

export const HomeButton = () => (
  <Link to="/" data-testid="home-button">
    <img
      src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/stream-logo.png`}
      alt="Stream logo"
      width={36}
      height={36}
    />
  </Link>
);

export const UserMenu = () => {
  const {
    settings: { language, setLanguage },
  } = useSettings();

  return (
    <div className="rd__user-session__menu">
      <ul className="rd__user-session__menu-list">
        <li className="rd__user-session__menu-item">
          <LanguageMenu language={language} setLanguage={setLanguage!} />
        </li>

        <li className="rd__user-session__menu-item">
          <button className="rd__button rd__user-session__menu-button">
            <Icon
              className="rd__button__icon rd__user-session__menu-icon"
              icon="logout"
            />
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export const UserInfo = () => {
  return <ToggleLogoutButton />;
};

const ToggleMenuButton = forwardRef<HTMLDivElement>(function ToggleMenuButton(
  props,
  ref
) {
  return (
    <div className="rd__user-session" ref={ref}>
      <div className="rd__user-session__container">
        <div className="rd__user-session__user">
          {/* <p className="rd__user-session__name">{theSession.user.name}</p>
          <p className="rd__user-session__email">{theSession.user.email}</p> */}
        </div>
      </div>
    </div>
  );
});

const ToggleLogoutButton = () => {
  return (
    <MenuToggle placement="bottom-end" ToggleButton={ToggleMenuButton}>
      <UserMenu />
    </MenuToggle>
  );
};
