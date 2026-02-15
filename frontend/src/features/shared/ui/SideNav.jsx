import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import "react-pro-sidebar/dist/css/styles.css";
import Button from "./Button";

export default function SideNav({ items, activeId, onChange }) {
  return (
    <ProSidebar collapsed={false} width="100%">
      <Menu iconShape="square">
        {items.map((item) => (
          <MenuItem
            key={item.id}
            className={`side-nav-item ${activeId === item.id ? "is-active" : ""}`}
            onClick={() => onChange(item.id)}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </ProSidebar>
  );
}
