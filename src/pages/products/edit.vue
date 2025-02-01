<template lang="pug">
.container-md.p-3
  section.mb-3.hstack
    hgroup
      h1.mb-0 Редагувати продукт

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
          template(v-if="field.type === 'select'")
            select.form-select(
              :id="field.name + eIndex",
              v-model="field.value",
              :name="field.name",
              :class="fieldClass(field)"
            )
              option(value="") Оберіть категорію
              option(
                v-for="option in field.options",
                :key="option.id",
                :value="option.id"
              ) {{ option.name }}
          template(v-else)
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

    fieldset.bg-body.p-4.rounded.mb-3.has-validation
      legend Фото
      .d-flex.flex-wrap.gap-3
        div(
          v-for="(photoEntity, pIndex) in formData.photoEntities",
          :key="'photoEntity-' + pIndex",
          style="position: relative; width: 210px; height: 210px"
        )
          label.bg-body-tertiary.rounded.d-flex.justify-content-center.align-items-center(
            :class="photoFieldClass(photoEntity)",
            style="width: 210px; height: 210px; cursor: pointer",
            :for="'addPhoto-' + pIndex"
          )
            template(v-if="photoEntity.previewUrl")
              img(
                :src="photoEntity.previewUrl",
                alt="Preview",
                style="max-width: 200px; max-height: 200px"
              )
              button.btn.position-absolute.top-0.end-0(
                type="button",
                aria-label="Delete",
                @click="deletePhoto(pIndex)"
              )
                i.fa-solid.fa-trash.text-danger
            i.fa-regular.fa-plus.fs-3.text-muted(v-else)
          input(
            :id="'addPhoto-' + pIndex",
            type="file",
            accept="image/*",
            @change="onFileAdded($event, pIndex)",
            style="display: none"
          )
          .invalid-feedback(v-if="photoEntity.isEmpty") Фото обов'язково
          .invalid-feedback(v-else-if="photoEntity.isInvalid") Невірний формат зображення

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

const RE_NATURAL_WITH_ZERO = /^[0-9]\d*$/;
const RE_NATURAL_WITH_ZERO_D = /^(0(\.\d+)?|[1-9]\d*(\.\d+)?)$/;

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
      emptyFeedback: "Назва продукту обов'язкова",
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
      emptyFeedback: "Опис продукту обов'язковий",
      value: "",
      onChangeHandler: (field) => (newValue) => {
        resetFieldErrors(field);
      },
      validator: (field) => {
        field.isEmpty = !field.value && field.required;
        return !field.isEmpty;
      },
    },
    {
      name: "price",
      label: "Ціна, грн",
      placeholder: "150.99",
      type: "text",
      convert: "number",
      required: true,
      formText: "",
      invalidFeedback: "",
      emptyFeedback: "Ціна продукту обов'язкова",
      value: "0",
      onChangeHandler: (field) => (newValue) => {
        resetFieldErrors(field);
      },
      validator: validator(RE_NATURAL_WITH_ZERO_D),
    },
    {
      name: "stockQuantity",
      label: "Кількість на складі",
      placeholder: "",
      type: "text",
      convert: "number",
      required: true,
      invalidFeedback: "Вкажіть ціле натуральне число",
      emptyFeedback: "Кількість товару обов'язкова",
      value: "0",
      onChangeHandler: (field) => (newValue) => {
        resetFieldErrors(field);
      },
      validator: validator(RE_NATURAL_WITH_ZERO),
    },
    {
      name: "categoryId",
      label: "Категорія",
      required: true,
      type: "select",
      options: [],
      formText: "",
      invalidFeedback: "",
      emptyFeedback: "Оберіть категорію",
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
  file: null,
  previewUrl: "",
  isInvalid: false,
  isEmpty: false,
  isShowError: false,
  isExisting: false,
});

export default {
  data: () => ({
    categories: [],
    formData: {
      entities: [createEntity("Головне")],
      photoEntities: [createPhotoEntity("Фото")],
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

      let validPhotoExists = false;
      for (const photoEntity of this.formData.photoEntities) {
        if (photoEntity.isExisting) {
          validPhotoExists = true;
          continue;
        }

        if (photoEntity.file) {
          if (!photoEntity.file.type.startsWith("image/")) {
            return false;
          }
          validPhotoExists = true;
        }
      }
      return validPhotoExists;
    },
  },
  methods: {
    createWatcher(field) {
      this.$watch(() => field.value, field.onChangeHandler(field));
    },
    onFileAdded(event, index) {
      const fileList = event.target.files;
      if (fileList && fileList.length > 0) {
        const file = fileList[0];
        const photoEntity = this.formData.photoEntities[index];
        if (file && file.type && file.type.startsWith("image/")) {
          photoEntity.file = file;
          photoEntity.previewUrl = URL.createObjectURL(file);
          photoEntity.isInvalid = false;
          photoEntity.isEmpty = false;

          photoEntity.isExisting = false;
        } else {
          photoEntity.file = file;
          photoEntity.previewUrl = "";
          photoEntity.isInvalid = true;
          photoEntity.isEmpty = false;
        }

        if (index === this.formData.photoEntities.length - 1) {
          this.formData.photoEntities.push(createPhotoEntity("Фото"));
        }
      }
      event.target.value = "";
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
        let validPhotoFound = false;
        for (let i = 0; i < this.formData.photoEntities.length; i++) {
          const photoEntity = this.formData.photoEntities[i];

          if (
            i === this.formData.photoEntities.length - 1 &&
            !photoEntity.file &&
            !photoEntity.isExisting
          ) {
            continue;
          }

          if (!photoEntity.file && !photoEntity.isExisting) {
            photoEntity.isEmpty = true;
            isValid = false;
            this.scrollToError();
            break;
          }

          if (photoEntity.file && !photoEntity.file.type.startsWith("image/")) {
            photoEntity.isInvalid = true;
            isValid = false;
            this.scrollToError();
            break;
          }
          validPhotoFound = true;
        }
        if (!validPhotoFound) {
          isValid = false;
          this.scrollToError();
        }
      }

      if (!isValid) return;

      const preparedData = this.prepareData();
      this.isSubmitting = true;
      try {
        const response = await fetch(
          `${VITE_API_SERVER}/api/products/${this.$route.params.id}`,
          {
            method: "PATCH",
            body: preparedData,
          },
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Помилка сервера");
        }
        this.$router.push("/admin/products");
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
      const formDataToSend = new FormData();
      // Добавляем значения текстовых полей
      this.formData.entities.forEach((entity) => {
        entity.fields.forEach((field) => {
          let val = field.value;
          if (field.convert === "number") {
            val = parseFloat(val) || 0;
          }
          formDataToSend.append(field.name, val);
        });
      });

      const existingImages = [];
      this.formData.photoEntities.forEach((photoEntity) => {
        if (photoEntity.file) {
          formDataToSend.append(
            "images",
            photoEntity.file,
            photoEntity.file.name,
          );
        } else if (photoEntity.isExisting && photoEntity.previewUrl) {
          const parts = photoEntity.previewUrl.split("/");
          const imageName = parts[parts.length - 1];
          existingImages.push(imageName);
        }
      });

      formDataToSend.append("existingImages", JSON.stringify(existingImages));

      return formDataToSend;
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
    deletePhoto(index) {
      const photoEntity = this.formData.photoEntities[index];
      if (photoEntity.previewUrl) {
        URL.revokeObjectURL(photoEntity.previewUrl);
      }
      this.formData.photoEntities.splice(index, 1);
    },
    fieldClass(field) {
      return [field.class, field.isShowError && "is-invalid"]
        .filter(Boolean)
        .join(" ");
    },
    photoFieldClass(photoEntity) {
      return photoEntity.isEmpty || photoEntity.isInvalid ? "is-invalid" : "";
    },
  },
  async mounted() {
    const data = await getData(VITE_API_SERVER + "/api/categories");
    this.categories = data;
    const mainEntity = this.formData.entities[0];
    const categoryField = mainEntity.fields.find(
      (f) => f.name === "categoryId",
    );
    if (categoryField) {
      categoryField.options = data;
    }

    const productId = this.$route.params.id;
    try {
      const response = await fetch(
        `${VITE_API_SERVER}/api/products/${productId}`,
      );
      const product = await response.json();
      if (!response.ok) {
        throw new Error(product.message || "Помилка завантаження даних");
      }

      const mainEntity = this.formData.entities[0];
      const nameField = mainEntity.fields.find((f) => f.name === "name");
      const descField = mainEntity.fields.find((f) => f.name === "description");
      const priceField = mainEntity.fields.find((f) => f.name === "price");
      const stockField = mainEntity.fields.find(
        (f) => f.name === "stockQuantity",
      );
      const catField = mainEntity.fields.find((f) => f.name === "categoryId");
      if (nameField) nameField.value = product.name;
      if (descField) descField.value = product.description;
      if (priceField) priceField.value = product.price.toString();
      if (stockField) stockField.value = product.stockQuantity.toString();
      if (catField) catField.value = product.categoryId;

      if (product.images && product.images.length > 0) {
        this.formData.photoEntities = product.images.map((image) => ({
          file: null,
          previewUrl: `${VITE_NGINX_SERVER}/images/${image}`,
          isInvalid: false,
          isEmpty: false,
          isShowError: false,
          isExisting: true,
          legend: "Фото",
        }));

        this.formData.photoEntities.push(createPhotoEntity("Фото"));
      }
    } catch (error) {
      this.errorMessage =
        error.message || "Невідома помилка при завантаженні даних";
    }
  },
  created() {
    this.formData.entities.forEach((entity) => {
      entity.fields.forEach(this.createWatcher);
    });
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
    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M222.7 32.1c5 16.9-4.6 34.8-21.5 39.8C121.8 95.6 64 169.1 64 256c0 106 86 192 192 192s192-86 192-192c0-86.9-57.8-160.4-137.1-184.1c-16.9-5-26.6-22.9-21.5-39.8s22.9-26.6 39.8-21.5C434.9 42.1 512 140 512 256c0 141.4-114.6 256-256 256S0 397.4 0 256C0 140 77.1 42.1 182.9 10.6c16.9-5 34.8 4.6 39.8 21.5z"/></svg>')
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
