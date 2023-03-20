import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import React from "react";

import {
  DropdownButton,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuItems,
  DropdownTransition,
} from "@votewise/ui";
import { FiTrash2 as DeleteIcon, FiEdit2 as PencilIcon } from "@votewise/ui/icons";

type DropDownProps = {
  onDropDownItemClick: (action: "UPDATE" | "DELETE") => void;
};
export function DropDown(props: DropDownProps) {
  const { onDropDownItemClick } = props;
  return (
    <DropdownMenu className="ml-auto">
      <DropdownButton>
        <EllipsisHorizontalIcon className="h-6 w-6 text-gray-500" />
      </DropdownButton>
      <DropdownTransition>
        <DropdownMenuItems>
          <DropdownMenuItem className="gap-2" as="button" onClick={() => onDropDownItemClick("UPDATE")}>
            <PencilIcon className="h-5 w-5 text-gray-500" />
            <span>Update</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" as="button" onClick={() => onDropDownItemClick("DELETE")}>
            <DeleteIcon className="h-5 w-5 text-gray-500" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuItems>
      </DropdownTransition>
    </DropdownMenu>
  );
}
