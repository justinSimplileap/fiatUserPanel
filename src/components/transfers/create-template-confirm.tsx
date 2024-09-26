import { type FC } from "react";
import Image, { type StaticImageData } from "next/image";
import MuiButton from "~/components/MuiButton";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Divider,
    Grid,
    Box,
} from "@mui/material";
import closeIcon from "../../assets/general/close.svg";

interface ConfirmTemplateProps {
    open: boolean;
    // selectedRow: any;
    onClose: () => void;
    onConfirm: () => void;
}
const ConfirmDailog: FC<ConfirmTemplateProps> = ({
    open,
    onClose,
    onConfirm,
    // selectedRow,
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            className="text-[#1F1F1F]"
        >
            {/* <span className="p-12"> */}
            {/* Top Section with Title and Close Icon */}
            <DialogTitle className="p-8">
                <Grid container justifyContent="space-between" alignItems="center">
                    <span className="font-semibold lg:text-lg">New Beneficiary Details</span>
                    <IconButton edge="end" color="inherit" onClick={onClose}>
                        <Image src={closeIcon} alt="close" />
                    </IconButton>
                </Grid>
            </DialogTitle>

            <DialogContent className="no-scrollbar overflow-y-scroll p-8">
                {/* Transfer Details Section */}
                <Divider />

                {/* Beneficiary Details */}
                <h3 className="my-4 font-medium">Beneficiary Details</h3>
                <Grid container spacing={2} className="mt-2">
                    <Grid item xs={12} md={6} className="md:grid grid-cols-2 justify-between flex">
                        <strong>IBAN</strong> <p>true</p>
                    </Grid>
                    <Grid item xs={12} md={6} className="md:grid grid-cols-2 justify-between flex">
                        <strong>Customer Name </strong> <p>Address</p>
                    </Grid>
                    <Grid item xs={12} md={6} className="md:grid grid-cols-2 justify-between flex">
                        <strong>Address </strong> <p>Address</p>
                    </Grid>
                    <Grid item xs={12} md={6} className="md:grid grid-cols-2 justify-between flex">
                        <strong>Zip code</strong> <p>586209</p>
                    </Grid>
                    <Grid item xs={12} md={6} className="md:grid grid-cols-2 justify-between flex">
                        <strong>City</strong> <p>*****</p>
                    </Grid>
                    <Grid item xs={12} md={6} className="md:grid grid-cols-2 justify-between flex">
                        <strong>Country</strong> <p>USA</p>
                    </Grid>
                    <Grid item xs={12} md={6} className="md:grid grid-cols-2 justify-between flex">
                        <strong>Reference</strong>
                        <p>Texas</p>
                    </Grid>
                    <Grid item xs={12} md={6} className="md:grid grid-cols-2 justify-between flex">
                        <strong>Description</strong> <p>1225221</p>
                    </Grid>
                </Grid>

                {/* Beneficiary Bank Details */}
                <Box className="my-5">
                    <Divider />
                </Box>
                <h3 className="my-4 font-medium">Beneficiary Bank</h3>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6} className="md:grid grid-cols-2 justify-between flex">
                        <strong>Swift/Bic</strong> <p>true</p>
                    </Grid>
                    <Grid item xs={12} md={6} className="md:grid grid-cols-2 justify-between flex">
                        <strong>Bank Name</strong> <p>IBAN</p>
                    </Grid>
                    <Grid item xs={12} md={6} className="md:grid grid-cols-2 justify-between flex">
                        <strong>Bank Address</strong> <p>Address</p>
                    </Grid>
                    <Grid item xs={12} md={6} className="md:grid grid-cols-2 justify-between flex">
                        <strong>Bank Location</strong> <p>USA</p>
                    </Grid>
                    <Grid item xs={12} md={6} className="md:grid grid-cols-2 justify-between flex">
                        <strong>Country</strong> <p>USA</p>
                    </Grid>
                </Grid>

                {/* Buttons */}
                <Grid
                    container
                    justifyContent="right"
                    alignItems="center"
                    className="mt-10"
                >
                    <Grid item className="flex gap-5">
                        {/* First Button (Repeat) */}
                        <button
                            name="Cancel"
                            onClick={() => console.log("Cancel")}
                            className="text-[#000000]"
                        >
                            Cancel
                        </button>

                        {/* Second Button (Download PDF) */}
                        <MuiButton
                            name="Continue"
                            borderRadius="0.3rem"
                            background="black"
                            color="white"
                            borderColor="black"
                            style={{ minWidth: "150px" }}
                            onClick={onConfirm}
                        >
                        </MuiButton>
                    </Grid>
                </Grid>
            </DialogContent>
            {/* </span> */}
        </Dialog>
    );
};

export default ConfirmDailog;
