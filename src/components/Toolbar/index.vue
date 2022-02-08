<template>
  <div class="crud-opts">
    <span class="crud-opts-left">
      <!--左侧插槽-->
      <slot name="left" />
      <el-button v-if="optShow.create" v-permission="permission.create" class="filter-item" size="mini" type="primary" icon="el-icon-plus" @click="handleCreate"> 新增 </el-button>
      <slot name="middle-1" />
      <el-button v-if="optShow.update" v-permission="permission.update" class="filter-item" size="mini" type="success" icon="el-icon-edit" :disabled="selections.length !== 1" @click="handleUpdate(selections[0])"> 修改 </el-button>
      <slot name="middle-2" />
      <el-popconfirm v-if="optShow.delete" v-permission="permission.delete" :title="`确认删除所选${selections.length}条数据吗？`" @confirm="handleDelete(selections[0])">
        <el-button slot="reference" class="filter-item" size="mini" type="danger" icon="el-icon-delete" :disabled="(selections.length !== 1 && !isBatch) || selections.length === 0"> 删除 </el-button>
      </el-popconfirm>
      <slot name="middle-3" />
      <el-button v-if="optShow.download" v-permission="permission.download" class="filter-item" size="mini" type="warning" icon="el-icon-download" :loading="downloadLoading" @click="handleDownload"> 导出 </el-button>
      <!--右侧-->
      <slot name="right" />
    </span>
    <el-button-group class="crud-opts-right">
      <el-button size="mini" plain type="info" icon="el-icon-search" @click="toggleSearch()" />
      <el-button size="mini" icon="el-icon-refresh" @click="getTableList()" />
      <el-popover placement="bottom-end" width="150" trigger="click">
        <el-button slot="reference" size="mini" icon="el-icon-s-grid">
          <i class="fa fa-caret-down" aria-hidden="true" />
        </el-button>
        <el-checkbox v-model="checkAllColumns" :indeterminate="isIndeterminate" @change="handleCheckAllChange">全选</el-checkbox>
        <el-checkbox-group v-model="checkColumns" @change="handleCheckCloumnChange">
          <el-checkbox v-for="(column, index) in tableColumns" :key="index" :label="index">{{ column.title }}</el-checkbox>
        </el-checkbox-group>
      </el-popover>
    </el-button-group>
  </div>
</template>

<script>
export default {
  props: {
    optShow: {
      type: Object,
      default: () => { return {} }
    },
    permission: {
      type: Object,
      default: () => { return {} }
    },
    selections: {
      type: Array,
      default: () => { return [] }
    },
    isBatch: {
      type: Boolean,
      default: false
    },
    tableColumns: {
      type: Object,
      default: () => { return {} }
    }
  },
  data() {
    return {
      checkAllColumns: false,
      isIndeterminate: true,
      checkColumns: [],
      downloadLoading: false
    }
  },
  watch: {
    checkColumns(valArr) {
      for (const column in this.tableColumns) {
        const findIndex = valArr.some(item => item === column)
        if (findIndex !== true) {
          this.tableColumns[column].visible = false
        } else {
          this.tableColumns[column].visible = true
        }
      }
      this.key++
    }
  },
  created() {
    for (const column in this.tableColumns) {
      if (this.tableColumns[column].visible === true) {
        this.checkColumns.push(column)
      }
    }
  },
  methods: {
    // 隐藏工具栏
    toggleSearch() {
      this.$parent.searchToggle = !this.$parent.searchToggle
    },
    handleCreate() {
      this.$parent.handleCreate()
    },
    handleUpdate(val) {
      this.$parent.handleUpdate(val)
    },
    handleDelete(val) {
      this.$parent.handleDelete(val)
    },
    handleDownload() {
      this.$parent.handleDownload()
    },
    getTableList() {
      this.$parent.getTableList()
    },
    handleCheckAllChange(val) {
      if (val) {
        this.checkColumns = Object.keys(this.tableColumns)
      } else {
        this.checkColumns = []
      }
      this.isIndeterminate = false
    },
    handleCheckCloumnChange(value) {
      const checkedCount = value.length
      this.checkAllColumns = checkedCount === Object.keys(this.tableColumns).length
      this.isIndeterminate = checkedCount > 0 && checkedCount < Object.keys(this.tableColumns).length
    }
  }
}
</script>

<style>
  .crud-opts {
    padding: 4px 0;
    display: -webkit-flex;
    display: flex;
    align-items: center;
  }
  .crud-opts .crud-opts-right {
    margin-left: auto;
  }
  .crud-opts .crud-opts-right span {
    float: left;
  }
</style>
