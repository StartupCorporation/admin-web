<template lang="pug">
.container-md.p-3
  section.mb-3.hstack
    hgroup
      h1.mb-0 Створити продукт

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
            :maxlength="field.maxlength"
          )
          .invalid-feedback(v-if="field.isEmpty") {{ field.emptyFeedback }}
          .invalid-feedback(v-else-if="field.isInvalid") {{ field.invalidFeedback }}
          .form-text.odb-loading(v-else, :class="field.isLoading && 'loading'") {{ field.formText || field.defaultFormText }}

    fieldset.bg-body.p-3.rounded.mb-3.has-validation(
      v-for="(userEntity, uIndex) in formData.userEntities",
      :key="'userEntity-' + uIndex"
    )
      legend.d-flex.justify-content-between.align-items-center
        span {{ userEntity.legend }}
        button.btn.btn-close.btn-sm(
          v-if="uIndex > 0",
          type="button",
          aria-label="Close",
          @click="deleteUser(uIndex)"
        )

      .row(
        v-for="(field, fIndex) in userEntity.fields",
        :key="'userField-' + fIndex"
      )
        label.col-sm-4.col-form-label(:for="field.name + 'User' + uIndex") {{ field.label }}

        .col-sm-8.mb-3
          label.bg-body-tertiary.rounded.mb-2.d-flex.justify-content-center.align-items-center(
            style="width: 210px; height: 210px",
            :for="field.name + 'User' + uIndex"
          )
            img(
              v-if="field.previewUrl",
              :src="field.previewUrl",
              alt="Preview",
              style="max-width: 200px; max-height: 200px"
            )

          input.form-control(
            :id="field.name + 'User' + uIndex",
            @change="onFileChanged($event, field)",
            :type="field.type || 'text'",
            :placeholder="field.placeholder",
            :aria-label="field.label",
            :class="fieldClass(field)"
          )
          .invalid-feedback(v-if="field.isEmpty") {{ field.emptyFeedback }}
          .invalid-feedback(v-else-if="field.isInvalid") {{ field.invalidFeedback }}
          .form-text.odb-loading(v-else) {{ field.formText || "" }}

    .row.g-3.mb-3
      .col-12
        button.btn.btn-sm(type="button", @click="addUserEntity")
          i.fa-regular.fa-image.me-1
          | Додати ще фото

    .row
      .col.d-flex.justify-content-center
        button.btn.btn-primary.ms-3.ms-sm-2(type="submit")
          template(v-if="!isSubmitting")
            | Створити
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

const createContract = () => {};

const { VITE_API_SERVER } = process.env;

const RE_NATURAL_WITH_ZERO = /^[0-9]\d*$/;
const RE_NATURAL_WITH_ZERO_D = /^(0(\.\d+)?|[1-9]\d*(\.\d+)?)$/;

const VAT_RATE = 0.2;

const PRODUCT_ID = "11904c04d8d861512153161c";

let COMPANY_NAME = "";

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
      name: "productName",
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
      name: "productDescription",
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
      name: "productPrice",
      label: "Ціна, €",
      placeholder: "150.99",
      type: "text",
      required: true,
      formText: "Ціну вказуйте у євро",
      invalidFeedback: "",
      emptyFeedback: "Ціна продукту обов'язкова",
      value: "0",
      onChangeHandler: (field) => (newValue) => {
        resetFieldErrors(field);
      },
      validator: validator(RE_NATURAL_WITH_ZERO_D),
    },
    {
      name: "productInStock",
      label: "В наявності",
      placeholder: "",
      type: "text",
      required: true,
      invalidFeedback: "Вкажіть ціле натуральне число",
      emptyFeedback: "Кількість товару обов'язкова",
      value: "0",
      onChangeHandler: (field) => (newValue) => {
        resetFieldErrors(field);
      },
      validator: validator(RE_NATURAL_WITH_ZERO),
    },
  ],
});

const createCharacteristic = (legend) => ({
  legend,
  fields: [
    {
      name: "productBrand",
      label: "Бренд",
      placeholder: "Bosch",
      required: true,
      formText: "",
      invalidFeedback: "",
      emptyFeedback: "Назва бренду обов'язкова",
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
      name: "productType",
      label: "Тип",
      placeholder: "SLA",
      required: true,
      formText: "",
      invalidFeedback: "",
      emptyFeedback: "Тип продукту обов'язковий",
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
      name: "productVoltage",
      label: "Напруга",
      placeholder: "12",
      type: "text",
      required: true,
      invalidFeedback: "Вкажіть ціле натуральне число",
      emptyFeedback: "Напруга обов'язкова",
      value: "",
      onChangeHandler: (field) => (newValue) => {
        resetFieldErrors(field);
      },
      validator: validator(RE_NATURAL_WITH_ZERO),
    },
    {
      name: "productAmperage",
      label: "Сила струму",
      placeholder: "540",
      type: "text",
      required: true,
      invalidFeedback: "Вкажіть ціле натуральне число",
      emptyFeedback: "Сила струму обов'язкова",
      value: "",
      onChangeHandler: (field) => (newValue) => {
        resetFieldErrors(field);
      },
      validator: validator(RE_NATURAL_WITH_ZERO),
    },
    {
      name: "productMadeIn",
      label: "Виробник",
      placeholder: "",
      required: true,
      formText: "Виберіть країну виробника зi списку",
      invalidFeedback: "",
      emptyFeedback: "Виробник обов'язковий",
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

// createPhotoEntity
const createUserEntity = (legend) => ({
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

        if (!newValue) {
          // Если вдруг файл не выбран
          field.value = null;
          field.previewUrl = "";
          return;
        }

        // Предположим, что newValue — это FileList (или один File).
        // Берём первый файл из списка.
        const file = newValue instanceof FileList ? newValue[0] : newValue;
        field.value = file;

        // Проверка: действительно ли это картинка
        if (file && file.type && file.type.startsWith("image/")) {
          // Создаём blob-URL и сохраняем в previewUrl
          field.previewUrl = URL.createObjectURL(file);
        } else {
          field.previewUrl = "";
          field.isInvalid = true; // Чтобы отобразить ошибку
        }
      },
      validator: (field) => {
        field.isEmpty = !field.value && field.required;
        // При желании можно ещё проверять размер или конкретные типы
        // if (field.value && field.value.size > 5_000_000) ...
        return !field.isEmpty && !field.isInvalid;
      },
    },
  ],
});

export default {
  data: () => ({
    formData: {
      entities: [
        createEntity("Головне"),
        createCharacteristic("Характеристики"),
      ],
      userEntities: [createUserEntity("")],
    },
    pricePerLicense: 0,
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

      for (const entity of this.formData.userEntities) {
        for (const field of entity.fields) {
          if (!field.validator(field)) {
            return false;
          }
        }
      }

      return true;
    },
    amountAfterDiscount() {
      const entity = this.currentEntities[0];
      if (!entity) return 0;

      const discountField = entity.fields.find((f) => f.name === "discount");

      const discount = discountField ? parseFloat(discountField.value) || 0 : 0;

      const licensesCount = this.formData.userEntities.length || 1;
      const baseSum = this.pricePerLicense * licensesCount;

      return baseSum * (1 - discount / 100);
    },
    calculateTax() {
      return Math.ceil(this.amountAfterDiscount * VAT_RATE * 10) / 10;
    },
    totalAmountWithTax() {
      return (
        Math.ceil((this.amountAfterDiscount + this.calculateTax) * 10) / 10
      );
    },
    contractSummary() {
      const entity = this.currentEntities[0];
      if (!entity) return "";
      const discountField = entity.fields.find((f) => f.name === "discount");
      const discount = discountField ? parseFloat(discountField.value) || 0 : 0;

      const licensesCount = this.formData.userEntities.length;
      if (licensesCount === 0) return "";

      const total = this.totalAmountWithTax;
      const discountStr = discount + " %";
      const taxValue = this.calculateTax;

      const vatStr = taxValue.toFixed(1) + " грн";
      return `Сума контракту ${total.toFixed(1)} грн з ПДВ (${vatStr}), зі знижкою ${discountStr}`;
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
        for (const entity of this.formData.userEntities) {
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

      const { contract, licenses } = this.prepareData();
      const authToken = getCookie("auth._token.local");

      this.isSubmitting = true;

      try {
        await createContract(
          {
            ...contract,
            users: licenses,
          },
          authToken,
        );
        await this.$router.push(
          `/a/subscriptions?offset=0&limit=12&sortDirection=DESC&sortKeys=startDate&status=active&productId=${PRODUCT_ID}`,
        );
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
      const contractData = {};
      this.formData.entities.forEach((entity) => {
        entity.fields.forEach((field) => {
          let val = field.value;
          if (field.name === "discount") {
            val = parseFloat(val) || 0;
          }
          contractData[field.name] = val;
        });
      });

      contractData.taxApplied = true;
      contractData.productId = PRODUCT_ID;
      contractData.companyName = COMPANY_NAME;

      const licensesData = this.formData.userEntities.map((userEntity) => {
        const license = {};
        userEntity.fields.forEach((field) => {
          license[field.name] = field.value;
        });
        return license;
      });

      return {
        contract: contractData,
        licenses: licensesData,
      };
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
    addUserEntity() {
      const newUserEntity = createUserEntity("");
      newUserEntity.fields.forEach(this.createWatcher);
      this.formData.userEntities.push(newUserEntity);
    },
    deleteUser(index) {
      if (index === 0) return;
      this.formData.userEntities.splice(index, 1);
    },
    fieldClass(field) {
      return [field.class, field.isShowError && "is-invalid"]
        .filter(Boolean)
        .join(" ");
    },
  },
  async mounted() {
    const productTypes = await getData(`${VITE_API_SERVER}/products`);
    const product = productTypes.data.corporate.products.find(
      (p) => p._id === PRODUCT_ID,
    );
    this.pricePerLicense = product.price;
  },
  created() {
    this.formData.entities.forEach((entity) => {
      entity.fields.forEach(this.createWatcher);
    });
    this.formData.userEntities.forEach((entity) => {
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
