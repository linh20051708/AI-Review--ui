import type { ReactNode } from "react"
import Button from "./Button"
import Modal from "./Modal"

interface Props {
  open: boolean
  title: string
  description?: ReactNode
  confirmLabel: string
  danger?: boolean
  onConfirm: () => void
  onClose: () => void
  children?: ReactNode
}

export default function ConfirmModal({ open, title, description, confirmLabel, danger, onConfirm, onClose, children }: Props) {
  return (
    <Modal
      open={open}
      title={title}
      description={description}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button
            className={danger ? "!border-danger !bg-danger text-white" : ""}
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  )
}
