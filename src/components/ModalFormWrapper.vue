<template lang="pug">
#modalFormWrapper.modal.fade(
  ref="modalFormWrapper",
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
        form.needs-validation(
          :id="formId",
          novalidate,
          @submit.prevent="handleSubmit",
          :class="{ 'was-validated': formValidated }",
          ref="form"
        )
          .alerts(ref="alerts")
            .alert(
              v-for="(alert, index) in alerts",
              :key="index",
              :class="alert.className",
              role="alert"
            )
              | {{ alert.msg }}

          slot
      .modal-footer
        button.btn.btn-secondary(type="button", data-bs-dismiss="modal") Закрити
        button.btn.btn-primary(
          type="submit",
          :form="formId",
          :disabled="confirmButton.loading"
        ) {{ confirmButtonText }}
</template>

<script>
import { Modal } from "bootstrap";

export default {
  props: {
    modalTitle: {
      type: String,
    },
    confirmButtonText: {
      type: String,
    },
    formId: {
      type: String,
    },
    onSubmit: {
      type: Function,
      default: null,
    },
  },
  data() {
    return {
      alerts: [],
      confirmButton: {
        loading: false,
      },
      formValidated: false,
    };
  },
  methods: {
    handleSubmit() {
      this.formValidated = true;

      const form = this.$refs.form;

      if (form.checkValidity() === false) {
        this.createAlert({
          msg: "Будь ласка, виправте помилки у формі",
          className: "alert-danger",
        });
        return;
      }

      this.confirmButton.loading = true;

      if (this.onSubmit) {
        this.onSubmit()
          .then(() => {
            this.confirmButton.loading = false;
            this.formValidated = false;
            this.createAlert({
              msg: "Операція успішно виконана",
              className: "alert-success",
            });
            this.hideModal();
          })
          .catch((error) => {
            this.confirmButton.loading = false;
            this.createAlert({
              msg: error.message || "Сталася помилка",
              className: "alert-danger",
            });
          });
      } else {
        this.confirmButton.loading = false;
      }
    },
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
      const modalElement = this.$refs.modalFormWrapper;
      let modalInstance = Modal.getInstance(modalElement);
      if (!modalInstance) {
        modalInstance = new Modal(modalElement);
      }
      modalInstance.show();
    },
    hideModal() {
      const modalElement = this.$refs.modalFormWrapper;
      let modalInstance = Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    },
  },
};
</script>
