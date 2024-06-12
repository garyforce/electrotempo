import PropTypes from "prop-types";
import { usePermissions } from "./PermissionContext";

/**
 * This component will show or hide its children depending on whether the given
 * `permission` prop is contained within the list of permissions in the
 * PermissionContext. If the permission is not found in the PermissionContext,
 * this component returns the `renderNoAccess` render prop or `null` if it is
 * not defined.
 */
type AccessControlProps = {
  permission: string;
  renderNoAccess?: JSX.Element;
  children: JSX.Element;
};

const AccessControl = ({
  permission,
  renderNoAccess,
  children,
}: AccessControlProps) => {
  const permissions = usePermissions();
  return permissions.includes(permission) ? children : renderNoAccess ?? null;
};

AccessControl.propTypes = {
  permission: PropTypes.string.isRequired,
  renderNoAccess: PropTypes.element,
};

export default AccessControl;
