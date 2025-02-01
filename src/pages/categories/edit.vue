<template lang="pug">
.container-md.p-3
  section.mb-3.hstack
    hgroup
      h1.mb-0 Редагувати категорію

  .alert.alert-danger(v-if="errorMessage") {{ errorMessage }}

  form(v-cloak, @submit.prevent="handleSubmit") 
    fieldset.bg-body.p-3.rounded.mb-3.has-validation(
      v-for="(entity, eIndex) in currentEntities",
      :key="'entity-' + eIndex"
    )
      legend {{ entity.legend }}
      .row(v-for="(field, fIndex) in entity.fields", :key="'field-' + fIndex")
        label.col-sm-4.col-form-label(:for="field.name + eIndex") {{ field.label }}
        .col-sm-8.mb-3
          input.form-control(
            :id="field.name + eIndex",
            v-model="field.value",
            :type="field.type || 'text'",
            :name="field.name",
            :placeholder="field.placeholder",
            :class="fieldClass(field)",
            :maxlength="field.maxlength",
            autocomplete="off"
          )
          .invalid-feedback(v-if="field.isEmpty") {{ field.emptyFeedback }}
          .invalid-feedback(v-else-if="field.isInvalid") {{ field.invalidFeedback }}
          .form-text.odb-loading(v-else, :class="field.isLoading && 'loading'") {{ field.formText || field.defaultFormText }}

    fieldset.bg-body.p-3.rounded.mb-3.has-validation(
      v-for="(photoEntity, uIndex) in formData.photoEntities",
      :key="'photoEntity-' + uIndex"
    )
      legend.d-flex.justify-content-between.align-items-center
        span {{ photoEntity.legend }}
        button.btn.btn-close.btn-sm(
          v-if="uIndex > 0",
          type="button",
          aria-label="Close",
          @click="deletePhoto(uIndex)"
        )

      .row(
        v-for="(field, fIndex) in photoEntity.fields",
        :key="'photoField-' + fIndex"
      )
        label.col-sm-4.col-form-label(:for="field.name + 'Photo' + uIndex") {{ field.label }}

        .col-sm-8.mb-3
          label.bg-body-tertiary.rounded.d-flex.justify-content-center.align-items-center(
            style="width: 210px; height: 210px; cursor: pointer",
            :for="field.name + 'Photo' + uIndex"
          )
            img(
              v-if="field.previewUrl",
              :src="field.previewUrl",
              alt="Preview",
              style="max-width: 200px; max-height: 200px"
            )
            i.fa-regular.fa-plus.fs-3.text-muted(v-else)
          input(
            :id="field.name + 'Photo' + uIndex",
            type="file",
            accept="image/*",
            @change="onFileChanged($event, field)",
            :placeholder="field.placeholder",
            :aria-label="field.label",
            :class="fieldClass(field)",
            style="display: none"
          )
          .invalid-feedback(v-if="field.isEmpty") {{ field.emptyFeedback }}
          .invalid-feedback(v-else-if="field.isInvalid") {{ field.invalidFeedback }}
          .form-text.odb-loading(v-else) {{ field.formText || "" }}

    .row
      .col.d-flex.justify-content-center
        button.btn.btn-primary.ms-3.ms-sm-2(type="submit")
          template(v-if="!isSubmitting")
            | Оновити
          template(v-else)
            span.spinner-border.spinner-border-sm.me-2(
              role="status",
              aria-hidden="true"
            )
            | Завантаження...
</template>

<script>
import getCookie from "../../utils/cookie-helper.js";
import getData from "../../utils/fetch.js";

const { VITE_API_SERVER, VITE_NGINX_SERVER } = process.env;

const validator = (re) => (field) => {
  field.isEmpty = false;
  field.isInvalid = false;

  if (!field.value && field.required) {
    field.isEmpty = true;
  } else if (re && field.value) {
    field.isInvalid = !re.test(field.value);
  }

  return field.required ? !field.isEmpty && !field.isInvalid : !field.isInvalid;
};

const resetFieldErrors = (field) => {
  field.isShowError = false;
  field.isInvalid = false;
  field.isEmpty = false;
  field.formText = field.formText || "";
};

const createEntity = (legend) => ({
  legend,
  fields: [
    {
      name: "name",
      label: "Назва",
      required: true,
      formText: "",
      invalidFeedback: "",
      emptyFeedback: "Назва категорії обов'язкова",
      value: "",
      isLoading: false,
      onChangeHandler: (field) => (newValue) => {
        resetFieldErrors(field);
      },
      validator: (field) => {
        field.isEmpty = !field.value && field.required;
        return !field.isEmpty;
      },
    },
    {
      name: "description",
      label: "Опис",
      placeholder: "",
      required: true,
      formText: "",
      invalidFeedback: "",
      emptyFeedback: "Опис категорії обов'язковий",
      value: "",
      onChangeHandler: (field) => (newValue) => {
        resetFieldErrors(field);
      },
      validator: (field) => {
        field.isEmpty = !field.value && field.required;
        return !field.isEmpty;
      },
    },
  ],
});

const createPhotoEntity = (legend) => ({
  legend,
  fields: [
    {
      name: "photo",
      label: "Фото",
      type: "file",
      required: true,
      invalidFeedback: "Невірний формат зображення",
      emptyFeedback: "Фото обов'язково",
      value: null,
      previewUrl: "",
      onChangeHandler: (field) => (newValue) => {
        resetFieldErrors(field);

        if (!newValue || newValue.length === 0) {
          field.value = null;
          return;
        }

        const file = newValue instanceof FileList ? newValue[0] : newValue;
        field.value = file;

        if (file && file.type && file.type.startsWith("image/")) {
          field.previewUrl = URL.createObjectURL(file);
        } else {
          field.previewUrl = "";
          field.isInvalid = true;
        }
      },
      validator: (field) => {
        if (!field.value && field.previewUrl) {
          field.isEmpty = false;
          field.isInvalid = false;
          return true;
        }
        field.isEmpty = !field.value && field.required;
        return !field.isEmpty && !field.isInvalid;
      },
    },
  ],
});

export default {
  data: () => ({
    formData: {
      entities: [createEntity("Головне")],
      photoEntities: [createPhotoEntity("")],
    },
    isSubmitting: false,
    errorMessage: "",
  }),
  computed: {
    currentEntities() {
      return this.formData.entities;
    },
    isFormValid() {
      for (const entity of this.formData.entities) {
        for (const field of entity.fields) {
          if (!field.validator(field)) {
            return false;
          }
        }
      }

      for (const entity of this.formData.photoEntities) {
        for (const field of entity.fields) {
          if (!field.validator(field)) {
            return false;
          }
        }
      }

      return true;
    },
  },
  methods: {
    onFileChanged(e, field) {
      const fileList = e.target.files;
      field.onChangeHandler(field)(fileList);
    },
    async handleSubmit() {
      this.errorMessage = "";
      let isValid = true;

      for (const entity of this.currentEntities) {
        for (const field of entity.fields) {
          if (!field.validator(field)) {
            field.isShowError = true;
            isValid = false;
            this.scrollToError();
            break;
          } else {
            field.isShowError = false;
          }
        }
        if (!isValid) break;
      }

      if (isValid) {
        for (const entity of this.formData.photoEntities) {
          for (const field of entity.fields) {
            if (!field.validator(field)) {
              field.isShowError = true;
              isValid = false;
              this.scrollToError();
              break;
            } else {
              field.isShowError = false;
            }
          }
          if (!isValid) break;
        }
      }

      if (!isValid) return;

      const preparedData = this.prepareData();

      this.isSubmitting = true;

      try {
        const response = await fetch(
          `${VITE_API_SERVER}/api/categories/${this.$route.params.id}`,
          {
            method: "PATCH",
            body: preparedData,
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Помилка сервера");
        }

        this.$router.push("/admin/categories");
      } catch (error) {
        this.errorMessage = error.message || "Невідома помилка";
        this.isSubmitting = false;
        this.scrollToError();

        setTimeout(() => {
          this.errorMessage = "";
        }, 5000);
      }
    },
    prepareData() {
      const formData = new FormData();

      this.formData.entities.forEach((entity) => {
        entity.fields.forEach((field) => {
          formData.append(field.name, field.value);
        });
      });

      this.formData.photoEntities.forEach((photoEntity, index) => {
        photoEntity.fields.forEach((field) => {
          if (field.value) {
            formData.append("image", field.value, field.value.name);
          }
        });
      });

      return formData;
    },

    createWatcher(field) {
      this.$watch(() => field.value, field.onChangeHandler(field));
    },
    scrollToError() {
      this.$nextTick(() => {
        const firstErrorElement = document.querySelector(".is-invalid");
        if (firstErrorElement) {
          const { id } = firstErrorElement;
          const label = document.querySelector(`label[for="${id}"]`);
          if (label) {
            label.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        } else if (this.errorMessage) {
          const alertElement = document.querySelector(".alert.alert-danger");
          if (alertElement) {
            alertElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }
      });
    },
    fieldClass(field) {
      return [field.class, field.isShowError && "is-invalid"]
        .filter(Boolean)
        .join(" ");
    },
    deletePhoto(index) {
      this.formData.photoEntities.splice(index, 1);
    },
  },
  created() {
    this.formData.entities.forEach((entity) => {
      entity.fields.forEach(this.createWatcher);
    });
    this.formData.photoEntities.forEach((entity) => {
      entity.fields.forEach(this.createWatcher);
    });
  },
  async mounted() {
    const categoryId = this.$route.params.id;
    try {
      const response = await fetch(
        `${VITE_API_SERVER}/api/categories/${categoryId}`,
      );
      const category = await response.json();
      if (!response.ok) {
        throw new Error(category.message || "Помилка завантаження даних");
      }
      const mainEntity = this.formData.entities[0];
      const nameField = mainEntity.fields.find(
        (field) => field.name === "name",
      );
      const descriptionField = mainEntity.fields.find(
        (field) => field.name === "description",
      );
      if (nameField) nameField.value = category.name;
      if (descriptionField) descriptionField.value = category.description;

      if (category.image) {
        const photoEntity = this.formData.photoEntities[0];
        const photoField = photoEntity.fields.find(
          (field) => field.name === "photo",
        );
        if (photoField) {
          photoField.previewUrl = `${VITE_NGINX_SERVER}/images/${category.image}`;
        }
      }
    } catch (error) {
      this.errorMessage =
        error.message || "Невідома помилка при завантаженні даних";
    }
  },
};
</script>

<style lang="sass" scoped>
$duration: 120ms

.expand-enter-active, .expand-leave-active
  transition: height $duration ease-in-out
  overflow: visible
  transition-property: opacity, height
  opacity: 0

.expand-enter, .expand-leave-to
  height: 0

.expand-enter-to, .expand-leave
  opacity: 1

.delay-enter-active
  transition-delay: $duration * 2
.delay-leave-active
  transition-delay: 0ms

.delay-enter-from,
.delay-leave-to
  opacity: 0

i.fa, .svg-inline--fa
  display: inline-block
  width: 1em
  height: 1em
  overflow: visible
  vertical-align: -0.125em

[data-bs-theme="dark"]
  .odb-loading
    &:before
      background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="White" d="M222.7 32.1c5 16.9-4.6 34.8-21.5 39.8C121.8 95.6 64 169.1 64 256c0 106 86 192 192 192s192-86 192-192c0-86.9-57.8-160.4-137.1-184.1c-16.9-5-26.6-22.9-21.5-39.8s22.9-26.6 39.8-21.5C434.9 42.1 512 140 512 256c0 141.4-114.6 256-256 256S0 397.4 0 256C0 140 77.1 42.1 182.9 10.6c16.9-5 34.8 4.6 39.8 21.5z"/></svg>')

.odb-loading
  position: relative
  transition: all 150ms ease-out

  &:before
    content: ''
    transition: opacity 250ms ease-out
    position: absolute
    top: .75em
    left: .625em
    width: 1em
    height: 1em
    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M222.7 32.1c5 16.9-4.6 34.8-21.5 39.8C121.8 95.6 64 169.1 64 256c0 106 86 192 192 192s192-86 192-192c0-86.9-57.8-160.4-137.1-184.1c-16.9-5-26.6-22.9-21.5-39.8s22.9-26.6 39.8-21.5z"/></svg>')
    background-size: cover
    transform-origin: center
    animation: spin .5s linear infinite
    transform: translateY(-50%)
    opacity: 0

  &.loading
    padding-left: 2em
    &:before
      opacity: 1

@keyframes spin
  0%
    transform: translateY(-50%) rotate(0deg)

  100%
    transform: translateY(-50%) rotate(360deg)
</style>
