import React from "react";

import {
  Badge,
  DropdownButton,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuItems,
  DropdownMenuItemsGroup,
  DropdownTransition,
} from "@votewise/ui";
import { FiArrowDown, FiClock, FiFilter } from "@votewise/ui/icons";

import { Indicator } from "../Indicator";

type PostStatus = "open" | "closed" | "archived" | "inprogress";

type FilterDropdownProps = {
  selected: PostStatus;
  orderBy: "asc" | "desc";
  onFilterChange: (status: PostStatus | "orderBy") => void;
};

export function FilterDropdown(props: FilterDropdownProps) {
  // TODO: Can implement Control props pattern to make this more reusable
  const { onFilterChange, selected, orderBy } = props;

  const handleOnDropdownItemClick = (status: PostStatus | "orderBy") => {
    onFilterChange?.(status);
  };

  return (
    <DropdownMenu>
      <DropdownButton>
        <Badge type="primary" className="flex items-center gap-2 rounded py-1">
          <span>
            <FiFilter className="h-5 w-5 text-gray-50" />
          </span>
          <span className="text-gray-50">Filters</span>
        </Badge>
      </DropdownButton>
      <DropdownTransition>
        <DropdownMenuItems>
          <DropdownMenuItemsGroup>
            <DropdownMenuItem
              className="group cursor-pointer gap-2"
              as="button"
              onClick={() => handleOnDropdownItemClick("open")}
            >
              <span>
                <Indicator isSelected={selected === "open"} />
              </span>
              <span>Open</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="group cursor-pointer gap-2"
              as="button"
              onClick={() => handleOnDropdownItemClick("closed")}
            >
              <span>
                <Indicator isSelected={selected === "closed"} />
              </span>
              <span>Closed</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="group cursor-pointer gap-2"
              as="button"
              onClick={() => handleOnDropdownItemClick("inprogress")}
            >
              <span>
                <Indicator isSelected={selected === "inprogress"} />
              </span>
              <span>In progress</span>
            </DropdownMenuItem>
          </DropdownMenuItemsGroup>
          <div className="w-full rounded-full border border-gray-200" />
          <DropdownMenuItemsGroup title={orderBy === "asc" ? "Ascending" : "Descending"}>
            <DropdownMenuItem
              className="group cursor-pointer justify-between"
              as="button"
              onClick={() => handleOnDropdownItemClick("orderBy")}
            >
              <div className="flex items-center gap-2">
                <span>
                  <FiClock className="h-5 w-5 text-gray-500" />
                </span>
                <span>Time</span>
              </div>
              <span>
                <FiArrowDown className={`h-5 w-5 text-gray-500 ${orderBy === "asc" && "rotate-180"}`} />
              </span>
            </DropdownMenuItem>
          </DropdownMenuItemsGroup>
        </DropdownMenuItems>
      </DropdownTransition>
    </DropdownMenu>
  );
}
