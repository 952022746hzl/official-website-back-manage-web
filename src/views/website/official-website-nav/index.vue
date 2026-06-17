<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-container">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="queryParams.title"
            placeholder="导航标题"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item class="search-buttons">
          <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
          <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="hover" class="data-table">
      <div class="data-table__toolbar">
        <div class="data-table__toolbar--actions">
          <el-button
            type="success"
            icon="plus"
            @click="handleOpenDialog()"
          >
            新增
          </el-button>
        </div>
      </div>

      <el-table
        ref="dataTableRef"
        v-loading="loading"
        row-key="id"
        :data="navTableData"
        :tree-props="{
          children: 'children',
          hasChildren: 'hasChildren',
        }"
        class="data-table__content"
        @row-click="handleRowClick"
      >
        <el-table-column label="标题" min-width="200" prop="title" />

        <el-table-column label="类型" align="center" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.type === 1" type="info">外链</el-tag>
            <el-tag v-else-if="scope.row.type === 2" type="success">内部路由</el-tag>
            <el-tag v-else-if="scope.row.type === 3" type="warning">分组目录</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="跳转地址" align="left" width="250" prop="linkTo" />
        <el-table-column label="排序" align="center" width="80" prop="sort" />
        <el-table-column label="状态" align="center" width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.visible === 1" type="success">显示</el-tag>
            <el-tag v-else type="info">隐藏</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="left" width="200" prop="remark" />
        <el-table-column label="创建时间" align="center" width="180">
          <template #default="scope">
            {{ scope.row.createTime ? useDateFormat(scope.row.createTime, "YYYY-MM-DD HH:mm:ss").value : "" }}
          </template>
        </el-table-column>

        <el-table-column fixed="right" align="center" label="操作" width="220">
          <template #default="scope">
            <el-button
              type="primary"
              link
              size="small"
              icon="plus"
              @click.stop="handleOpenDialog(scope.row.id)"
              v-if="scope.row.parentId == ROOT_NODE_ID"
            >
              新增子级
            </el-button>

            <el-button
              type="primary"
              link
              size="small"
              icon="edit"
              @click.stop="handleOpenDialog(undefined, scope.row.id)"
            >
              编辑
            </el-button>

            <el-button
              type="danger"
              link
              size="small"
              icon="delete"
              @click.stop="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑对话框组件 -->
    <OfficialWebsiteNavEditDialog
      v-model:visible="dialog.visible"
      :nav-id="dialog.navId"
      :parent-id="dialog.parentId"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { useDateFormat } from "@vueuse/core";
import OfficialWebsiteNavAPI from "@/api/website/official-website-nav";
import { OfficialWebsiteNavPageQuery, OfficialWebsiteNavVO } from "@/api/website/official-website-nav/type";
import OfficialWebsiteNavEditDialog from "./components/officialWebsiteNavEditDialog.vue";
import { ROOT_NODE_ID } from "@/api/common-enum";

defineOptions({
  name: "OfficialWebsiteNav",
  inheritAttrs: false,
});

const queryFormRef = ref();
const loading = ref(false);
const dialog = reactive({
  visible: false,
  navId: undefined as number | undefined,
  parentId: undefined as number | undefined,
});

// 查询参数
const queryParams = reactive<OfficialWebsiteNavPageQuery>({});
// 导航表格数据
const navTableData = ref<OfficialWebsiteNavVO[]>([]);

// 选择表格的行导航ID
const selectedNavId = ref<number | undefined>();

// 查询导航
function handleQuery() {
  loading.value = true;
  OfficialWebsiteNavAPI.getAllNavs(queryParams)
    .then((data) => {
      navTableData.value = data;
    })
    .finally(() => {
      loading.value = false;
    });
}

// 重置查询
function handleResetQuery() {
  queryFormRef.value.resetFields();
  handleQuery();
}

// 行点击事件
function handleRowClick(row: OfficialWebsiteNavVO) {
  selectedNavId.value = row.id;
}

/**
 * 打开表单弹窗
 *
 * @param parentId 父导航ID
 * @param navId 导航ID
 */
function handleOpenDialog(parentId?: number, navId?: number) {
  dialog.visible = true;
  dialog.parentId = parentId;
  dialog.navId = navId;
}

// 删除导航
function handleDelete(navId: number) {
  if (!navId) {
    ElMessage.warning("请选择删除项");
    return false;
  }

  ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      loading.value = true;
      OfficialWebsiteNavAPI.deleteByIds(navId.toString())
        .then(() => {
          ElMessage.success("删除成功");
          handleQuery();
        })
        .finally(() => {
          loading.value = false;
        });
    },
    () => {
      ElMessage.info("已取消删除");
    }
  );
}

// 对话框成功回调
function handleDialogSuccess() {
  handleQuery();
}

onMounted(() => {
  handleQuery();
});
</script>
