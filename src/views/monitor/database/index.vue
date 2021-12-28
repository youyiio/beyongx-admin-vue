<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="searchToggle">
        <el-input v-model="listQuery.filters.tableName" clearable size="small" placeholder="请输入表名" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter()" />
      </div>
    </div>
    <!--表格渲染-->
    <el-table ref="table" v-loading="listLoading" :data="list" style="width: 100%;">
      <el-table-column type="selection" width="55" />
      <el-table-column :show-overflow-tooltip="true" prop="tableName" label="表名" />
      <el-table-column :show-overflow-tooltip="true" prop="engine" label="数据库引擎" />
      <el-table-column :show-overflow-tooltip="true" prop="autoIncrement" label="当前自动增长值" />
      <el-table-column :show-overflow-tooltip="true" prop="tableRows" label="数据行" />
      <el-table-column :show-overflow-tooltip="true" prop="tableComment" label="备注" />
      <el-table-column prop="updateTime" label="更新日期" />
      <el-table-column prop="createTime" label="创建日期" />
      <el-table-column label="操作" width="160px" align="center" fixed="right">
        <template slot-scope="{ row }">
          <el-button v-permission="['database:view']" size="mini" type="primary" icon="el-icon-edit" @click="handleUpdate(row)" />
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getTableList()" />
  </div>
</template>

<script>

import { tables } from '@/api/monitor/database'
import Pagination from '@/components/Pagination'

export default {
  name: 'DatabaseIndex',
  components: { Pagination },
  data() {
    return {
      searchToggle: true,
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        size: 20,
        filters: {
          tableName: ''
        }
      }
    }
  },
  created() {
    this.getTableList()
  },
  methods: {
    getTableList() {
      this.listLoading = true
      const queryDatas = Object.assign(JSON.parse(JSON.stringify(this.listQuery)))
      tables(queryDatas).then((res) => {
        this.list = res.data.records
        this.total = res.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getTableList()
    },
    // 重置搜索
    handleReset() {
      this.$refs.searchForm.resetFields()
      this.handleFilter()
    }
  }
}
</script>

<style scoped>

</style>
