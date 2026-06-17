<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="600px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="父级导航" prop="parentId">
        <el-tree-select
          v-model="formData.parentId"
          placeholder="选择上级导航"
          :data="navOptions"
          filterable
          check-strictly
          :render-after-expand="false"
        />
      </el-form-item>

      <el-form-item label="导航标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入导航标题" />
      </el-form-item>

      <el-form-item label="导航类型" prop="type">
        <el-radio-group v-model="formData.type">
          <el-radio :value="1">外链</el-radio>
          <el-radio :value="2">内部路由</el-radio>
          <el-radio :value="3">分组目录</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="formData.type !== 3" label="跳转地址" prop="linkTo">
        <el-input
          v-model="formData.linkTo"
          :placeholder="formData.type === 1
            ? '请输入完整外链，如 https://example.com'
            : '请输入内部路由，需以 / 开头，如 /solutions/about'"
          @blur="handleLinkToBlur"
        />
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input-number
          v-model="formData.sort"
          style="width: 100px"
          controls-position="right"
          :min="0"
        />
      </el-form-item>

      <el-form-item label="显示状态" prop="visible">
        <el-switch v-model="formData.visible" :active-value="1" :inactive-value="0" />
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ROOT_NODE_ID } from "@/api/common-enum";
import OfficialWebsiteNavAPI from "@/api/website/official-website-nav";
import { OfficialWebsiteNavForm } from "@/api/website/official-website-nav/type";

interface Props {
  visible: boolean;
  navId?: number;
  parentId?: number;
}

interface Emits {
  (e: "update:visible", value: boolean): void;
  (e: "success"): void;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  navId: undefined,
  parentId: undefined,
});

const emit = defineEmits<Emits>();

const formRef = ref();
const submitLoading = ref(false);

// 对话框显示状态
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

// 对话框标题
const dialogTitle = computed(() => {
  return props.navId ? "编辑导航" : "新增导航";
});

// 导航下拉选项
const navOptions = ref<OptionType[]>([]);

// 初始表单数据
const initialFormData: OfficialWebsiteNavForm = {
  id: undefined,
  parentId: 0,
  type: 2, // 默认内部路由
  linkTo: "",
  title: "",
  sort: 1,
  visible: 1,
  remark: "",
};

// 表单数据
const formData = ref<OfficialWebsiteNavForm>({ ...initialFormData });

// 跳转地址按类型校验
const validateLinkTo = (_rule: any, value: string, callback: any) => {
  if (formData.value.type === 3) {
    callback();
    return;
  }
  if (!value) {
    callback(new Error("请输入跳转地址"));
    return;
  }
  if (formData.value.type === 1 && !/^https?:\/\//.test(value)) {
    callback(new Error("外链必须以 http:// 或 https:// 开头"));
    return;
  }
  if (formData.value.type === 2 && !value.startsWith("/") && !value.startsWith("#")) {
    callback(new Error("内部路由需以 / 开头，如 /solutions/about"));
    return;
  }
  callback();
};

// 表单验证规则
const rules = reactive({
  title: [{ required: true, message: "请输入导航标题", trigger: "blur" }],
  type: [{ required: true, message: "请选择导航类型", trigger: "change" }],
  linkTo: [{ validator: validateLinkTo, trigger: "blur" }],
  sort: [{ required: true, message: "请输入排序", trigger: "blur" }],
});

// 内部路由失焦自动补前导斜杠
function handleLinkToBlur() {
  const v = (formData.value.linkTo || "").trim();
  if (
    formData.value.type === 2 &&
    v &&
    !v.startsWith("/") &&
    !v.startsWith("#") &&
    !/^https?:\/\//.test(v)
  ) {
    formData.value.linkTo = "/" + v;
  }
}

// 切到分组目录时清空跳转地址
watch(
  () => formData.value.type,
  (t) => {
    if (t === 3) {
      formData.value.linkTo = "";
      formRef.value?.clearValidate?.("linkTo");
    }
  }
);

// 获取导航下拉选项
function getNavOptions() {
  OfficialWebsiteNavAPI.getNavOptions(true).then((data) => {
    navOptions.value = [{ value: ROOT_NODE_ID.toString(), label: "顶级导航", children: data }];
  });
}

// 获取表单数据
function getFormData() {
  if (props.navId) {
    OfficialWebsiteNavAPI.getFormData(props.navId).then((data) => {
      formData.value = { ...data };
    });
  } else {
    // 新增时重置表单并设置父级ID
    formData.value = { ...initialFormData };
    if (props.parentId !== undefined) {
      formData.value.parentId = props.parentId;
    }
  }
}

// 提交表单
function handleSubmit() {
  formRef.value.validate((isValid: boolean) => {
    if (isValid) {
      submitLoading.value = true;
      const navId = formData.value.id;

      const submitPromise = navId
        ? OfficialWebsiteNavAPI.update(navId, formData.value)
        : OfficialWebsiteNavAPI.create(formData.value);

      submitPromise
        .then(() => {
          ElMessage.success(navId ? "修改成功" : "新增成功");
          emit("success");
          handleClose();
        })
        .finally(() => {
          submitLoading.value = false;
        });
    }
  });
}

// 关闭对话框
function handleClose() {
  dialogVisible.value = false;
  resetForm();
}

// 重置表单
function resetForm() {
  formRef.value?.resetFields();
  formRef.value?.clearValidate();
  formData.value = { ...initialFormData };
}

// 监听对话框显示状态
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      getNavOptions();
      nextTick(() => {
        getFormData();
      });
    }
  }
);
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>
