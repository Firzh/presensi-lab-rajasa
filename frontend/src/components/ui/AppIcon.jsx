import {
  faAngleDown,
  faArrowRightToBracket,
  faArrowRightFromBracket,
  faBell,
  faBuilding,
  faCalendar,
  faChartBar,
  faCircleCheck,
  faCircleHalfStroke,
  faCircleQuestion,
  faCircleXmark,
  faClipboardList,
  faClock,
  faDoorOpen,
  faEye,
  faEyeSlash,
  faFileExport,
  faHeartPulse,
  faInbox,
  faList,
  faGear,
  faGraduationCap,
  faHouse,
  faIdCard,
  faLock,
  faMagnifyingGlass,
  faMicroscope,
  faPlus,
  faSchool,
  faShieldHalved,
  faToggleOn,
  faTriangleExclamation,
  faUser,
  faUserShield,
  faUserCheck,
  faUserGraduate,
  faUsers,
  faUsersGear,
  faWifi,
  faBars,
} from '@fortawesome/free-solid-svg-icons';

const iconMap = Object.freeze({
  angleDown: faAngleDown,
  arrowRightToBracket: faArrowRightToBracket,
  arrowRightFromBracket: faArrowRightFromBracket,
  bell: faBell,
  building: faBuilding,
  calendar: faCalendar,
  chartBar: faChartBar,
  circleCheck: faCircleCheck,
  circleHalfStroke: faCircleHalfStroke,
  circleQuestion: faCircleQuestion,
  circleXmark: faCircleXmark,
  clipboardList: faClipboardList,
  clock: faClock,
  doorOpen: faDoorOpen,
  eye: faEye,
  eyeSlash: faEyeSlash,
  fileExport: faFileExport,
  inbox: faInbox,
  list: faList,
  gear: faGear,
  graduationCap: faGraduationCap,
  house: faHouse,
  idCard: faIdCard,
  lock: faLock,
  magnifyingGlass: faMagnifyingGlass,
  microscope: faMicroscope,
  plus: faPlus,
  school: faSchool,
  shieldHalved: faShieldHalved,
  triangleExclamation: faTriangleExclamation,
  toggleOn: faToggleOn,
  user: faUser,
  userShield: faUserShield,
  userCheck: faUserCheck,
  userGraduate: faUserGraduate,
  users: faUsers,
  usersGear: faUsersGear,
  heartPulse: faHeartPulse,
  wifi: faWifi,
  bars: faBars,
});

export const APP_ICON_NAMES = Object.freeze(Object.keys(iconMap));

export function AppIcon({
  name,
  icon: iconDefinition,
  title,
  className = '',
  size = '1em',
  style,
  ...props
}) {
  const selectedIcon = iconDefinition ?? iconMap[name];

  if (!selectedIcon) {
    return null;
  }

  const [width, height, , , svgPathData] = selectedIcon.icon;
  const paths = Array.isArray(svgPathData) ? svgPathData : [svgPathData];

  const ariaProps = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': 'true' };

  return (
    <svg
      className={['app-icon', className].filter(Boolean).join(' ')}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      width={size}
      height={size}
      fill="currentColor"
      focusable="false"
      style={{
        display: 'inline-block',
        flexShrink: 0,
        verticalAlign: '-0.125em',
        ...style,
      }}
      {...ariaProps}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {paths.map((path, index) => (
        <path key={index} d={path} />
      ))}
    </svg>
  );
}
