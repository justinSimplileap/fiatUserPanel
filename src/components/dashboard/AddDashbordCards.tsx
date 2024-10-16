import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  TextField,
} from "@mui/material";
import Image from "next/image";
import React, { useState } from "react";
import closeIcon from "../../assets/images/close-circle.svg";
import SearchIcon from "../../assets/general/search_svg.svg";
import { cards } from "~/helpers/helper";
import { theme } from "~/constants/constant";

type Prop = {
  onClose: () => void;
};

export const AddDashbordCards = ({ onClose }: Prop) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter the cards based on the search term
  const filteredCards = cards.filter(
    (card) =>
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.country.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Dialog maxWidth="xs" fullWidth open={true} onClose={onClose}>
      <DialogTitle className="flex flex-col gap-5">
        <div className="flex justify-between">
          <p className="text-2xl font-medium">Add Account</p>
          <Image
            className="transform cursor-pointer duration-300 hover:scale-125"
            onClick={onClose}
            src={closeIcon}
            alt="close"
          />
        </div>

        <TextField
          placeholder="Search"
          size="small"
          className="w-full"
          value={searchTerm} // Bind the search term to the input value
          onChange={(e) => setSearchTerm(e.target.value)} // Update search term on change
          InputProps={{
            endAdornment: (
              <InputAdornment position="start">
                <Image src={SearchIcon} alt="search" />
              </InputAdornment>
            ),
          }}
        />
      </DialogTitle>
      <DialogContent className="flex flex-col gap-2">
        {filteredCards.map((item, i) => (
          <div key={i} className="flex gap-5">
            <Image className="h-10 w-10" src={item.icon} alt={item.name} />
            <p className="flex flex-col">
              <span className="text-lg font-semibold text-[#2C4364]">
                {item.country}
              </span>
              <span style={{ color: `${theme.text.color.primary}` }}>
                {item.name}
              </span>
            </p>
          </div>
        ))}
      </DialogContent>
    </Dialog>
  );
};
