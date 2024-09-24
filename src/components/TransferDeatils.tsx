// TransferDetailsDialog.tsx
import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";

interface TransferDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  selectedRow: any;
}

const TransferDetailsDialog: React.FC<TransferDetailsDialogProps> = ({
  open,
  onClose,
  selectedRow,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Transfer Details</DialogTitle>
      <DialogContent>
        {selectedRow && (
          <div>
            <p>
              <strong>Creation Date:</strong> {selectedRow.creationDate}
            </p>
            <p>
              <strong>Account:</strong> {selectedRow.account}
            </p>
            <p>
              <strong>Beneficiary Name:</strong> {selectedRow.beneficiaryName}
            </p>
            <p>
              <strong>Beneficiary IBAN:</strong> {selectedRow.beneficiaryIban}
            </p>
            <p>
              <strong>Status:</strong> {selectedRow.status}
            </p>
            <p>
              <strong>Client ID:</strong> {selectedRow.clientId}
            </p>
            <p>
              <strong>Amount:</strong> {selectedRow.amount}
            </p>
            <p>
              <strong>Currency:</strong> {selectedRow.currency}
            </p>
            <p>
              <strong>Fee:</strong> {selectedRow.fee}
            </p>
            <p>
              <strong>Balance:</strong> {selectedRow.balance}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransferDetailsDialog;
