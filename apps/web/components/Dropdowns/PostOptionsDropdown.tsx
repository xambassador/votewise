import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import React from "react";

import {
  DropdownButton,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuItems,
  DropdownMenuItemsGroup,
  DropdownTransition,
} from "@votewise/ui";
import { FiArchive, FiEdit2, FiTrash2 } from "@votewise/ui/icons";

import { Indicator } from "../Indicator";

type PostStatus = "open" | "closed" | "archived" | "inprogress";

type DropdownProps = {
  selected: PostStatus;
  onFilterChange: (status: PostStatus) => void;
  onUpdate: () => void;
  onDelete: () => void;
  onArchive: () => void;
};

export function PostOptionsDropdown(props: DropdownProps) {
  const { selected = "open", onFilterChange, onArchive, onDelete, onUpdate } = props;

  const handleOnDropdownItemClick = (status: PostStatus) => {
    onFilterChange(status);
  };

  return (
    <DropdownMenu>
      <DropdownButton>
        <EllipsisHorizontalIcon className="h-6 w-6 text-gray-500" />
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
          <DropdownMenuItemsGroup>
            <DropdownMenuItem className="group cursor-pointer gap-2" as="button" onClick={onUpdate}>
              <span>
                <FiEdit2 className="h-5 w-5 text-gray-500" />
              </span>
              <span>Update</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="group cursor-pointer gap-2" as="button" onClick={onDelete}>
              <span>
                <FiTrash2 className="h-5 w-5 text-gray-500" />
              </span>
              <span>Delete</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="group cursor-pointer gap-2" as="button" onClick={onArchive}>
              <span>
                <FiArchive className="h-5 w-5 text-gray-500" />
              </span>
              <span>Archive</span>
            </DropdownMenuItem>
          </DropdownMenuItemsGroup>
        </DropdownMenuItems>
      </DropdownTransition>
    </DropdownMenu>
  );
}
