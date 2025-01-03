<template lang="pug">
#modalWrapper.modal.fade(
  ref="modalWrapper",
  tabindex="-1",
  aria-labelledby="modalLabel",
  data-bs-backdrop="static",
  aria-hidden="true"
)
  .modal-dialog.modal-dialog-scrollable.modal-lg
    .modal-content
      .modal-header
        h5#modalLabel.modal-title {{ modalTitle }}
        button.btn-close(
          type="button",
          data-bs-dismiss="modal",
          aria-label="Close"
        )
      .modal-body
        slot
      .modal-footer
        button.btn.btn-secondary(type="button", data-bs-dismiss="modal") Закрити
</template>

<script>
import { Modal } from "bootstrap";

export default {
  props: {
    modalTitle: {
      type: String,
    },
  },
  data() {
    return {
      alerts: [],
    };
  },
  methods: {
    createAlert({ msg, className }) {
      this.alerts.push({ msg, className });
      setTimeout(() => {
        this.deleteAlert();
      }, 4000);
    },
    deleteAlert() {
      this.alerts.shift();
    },
    showModal() {
      const modalElement = this.$refs.modalWrapper;
      let modalInstance = Modal.getInstance(modalElement);
      if (!modalInstance) {
        modalInstance = new Modal(modalElement);
      }
      modalInstance.show();
    },
    hideModal() {
      const modalElement = this.$refs.modalWrapper;
      let modalInstance = Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    },
  },
};
</script>
