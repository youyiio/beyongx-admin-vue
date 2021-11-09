<template>
  <div class="crud-opts">
    <span class="crud-opts-left">
      <!--左侧插槽-->
      <slot name="left" />
      <el-button v-if="optShow.create" class="filter-item" size="mini" type="primary" icon="el-icon-plus" @click="handleCreate"> 新增 </el-button>
      <el-button v-if="optShow.update" class="filter-item" size="mini" type="success" icon="el-icon-edit" @click="handleUpdate"> 修改 </el-button>
      <el-button v-if="optShow.delete" class="filter-item" size="mini" type="danger" icon="el-icon-delete" @click="handleDelete"> 删除 </el-button>
      <el-button v-if="optShow.download" class="filter-item" size="mini" type="warning" icon="el-icon-download" :loading="downloadLoading" @click="handleDownload"> 导出 </el-button>
      <!--右侧-->
      <slot name="right" />
    </span>
    <el-button-group class="crud-opts-right">
      <el-button size="mini" plain type="info" icon="el-icon-search" />
      <el-button size="mini" icon="el-icon-refresh" />
      <el-popover placement="bottom-end" width="150" trigger="click">
        <el-button slot="reference" size="mini" icon="el-icon-s-grid">
          <i class="fa fa-caret-down" aria-hidden="true" />
        </el-button>
        <el-checkbox> 全选 </el-checkbox>
        <el-checkbox />
      </el-popover>
    </el-button-group>
  </div>
</template>

<script>
export default {
}
</script>
