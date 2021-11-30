<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :md="10" :lg="11" :xl="11" style="margin-bottom: 10px">
        <el-card class="box-card">
          <!--工具栏-->
          <div class="head-container">
            <div class="crud-opts">
              <span class="crud-opts-left">
                <el-button class="filter-item" size="mini" type="primary" icon="el-icon-plus" @click="handleCreate()"> 新增 </el-button>
                <el-button class="filter-item" size="mini" type="success" icon="el-icon-edit" :disabled="dictSelections.length !== 1" @click="handleUpdate(dictSelections[0])"> 修改 </el-button>
                <el-button class="filter-item" type="danger" icon="el-icon-delete" size="mini" :disabled="dictSelections.length !== 1" @click="handleDelete(dictSelections[0])"> 删除 </el-button>
              </span>
            </div>
          </div>
          <!--表格渲染-->
          <el-table ref="dictTable" :key="tableKey" v-loading="listLoading" :data="list" highlight-current-row style="width: 100%;" @selection-change="handleSelectionChange" @current-change="handleCurrentChange">
            <el-table-column type="selection" width="55" />
            <el-table-column :show-overflow-tooltip="true" label="名称" />
            <el-table-column :show-overflow-tooltip="true" label="描述" />
            <el-table-column label="操作" width="130px" align="center" fixed="right">
              <template slot-scope="{ row }">
                <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleUpdate(row)" />
                <el-button slot="reference" size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(row)" />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <!-- 字典详情列表 -->
      <el-col :xs="24" :sm="24" :md="14" :lg="13" :xl="13">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>字典详情</span>
            <el-button v-if="this.$refs.dictDetail && this.$refs.dictDetail.query.dictName" class="filter-item" size="mini" style="float: right;padding: 4px 10px" type="primary" icon="el-icon-plus" @click="$refs.dictDetail && $refs.dictDetail.handleCreate()">新增</el-button>
          </div>
          <dictDetail ref="dictDetail" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import dictDetail from './dictDetail'

export default {
  name: 'DictList',
  components: { dictDetail },
  data() {
    return {
      tableKey: 0,
      dictSelections: [],
      list: [],
      total: 0,
      listLoading: false
    }
  },
  methods: {
    // 新增字典组别
    handleCreate() {

    },
    handleUpdate() {

    },
    handleDelete() {

    },
    handleSelectionChange(val) {
      this.dictSelections = val
    },
    handleCurrentChange(val) {
    }
  }
}
</script>
