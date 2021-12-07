<template>
  <div class="app-container">
    <div class="head-container">
      <div v-if="searchToggle">
        <el-form ref="searchForm" :model="listQuery.filters" :inline="true">
          <el-form-item prop="username">
            <el-input v-model="listQuery.filters.username" clearable size="mini" placeholder="输入用户名搜索" style="width: 150px" class="filter-item" @keyup.enter.native="handleFilter()" />
          </el-form-item>
          <el-form-item prop="action">
            <el-input v-model="listQuery.filters.action" clearable size="mini" placeholder="输入操作名称搜索" style="width: 150px" class="filter-item" @keyup.enter.native="handleFilter()" />
          </el-form-item>
          <el-form-item prop="dateTime">
            <el-date-picker v-model="listQuery.filters.dateTime" clearable size="mini" type="daterange" align="right" start-placeholder="开始日期" end-placeholder="结束日期" :default-time="['00:00:00', '23:59:59']" value-format="yyyy-MM-dd HH:mm:ss" class="date-item" />
          </el-form-item>
          <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="handleFilter()"> 搜索 </el-button>
          <el-button class="filter-item" size="mini" type="warning" icon="el-icon-refresh-left" @click="handleReset()">重置</el-button>
        </el-form>
      </div>
      <div class="crud-opts">
        <el-button-group class="crud-opts-right">
          <el-button size="mini" plain type="info" icon="el-icon-search" @click="toggleSearch()" />
          <el-button size="mini" icon="el-icon-refresh" @click="getUserList()" />
          <el-popover placement="bottom-end" width="150" trigger="click">
            <el-button slot="reference" size="mini" icon="el-icon-s-grid">
              <i class="fa fa-caret-down" aria-hidden="true" />
            </el-button>
            <el-checkbox> 全选 </el-checkbox>
            <el-checkbox />
          </el-popover>
        </el-button-group>
      </div>
    </div>
    <!--表格渲染-->
    <el-table ref="logTable" :key="tableKey" v-loading="listLoading" :data="list">
      <el-table-column label="ID" prop="id" align="center" width="80" />
      <el-table-column label="用户名" prop="username" width="100" />
      <el-table-column label="操作名" prop="action" width="100" />
      <el-table-column label="IP" prop="ip" width="120" />
      <el-table-column label="来源" prop="address" width="100" />
      <el-table-column :show-overflow-tooltip="true" label="描述" prop="remark" />
      <el-table-column :show-overflow-tooltip="true" label="浏览器" prop="userAgent" />
      <el-table-column label="所属模块" prop="module" width="100" />
      <el-table-column label="创建时间" prop="createTime" width="180" />
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getLogList()" />
  </div>
</template>

<script>
import { logList } from '@/api/monitor/log'
import Pagination from '@/components/Pagination'

export default {
  name: 'LogList',
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
          action: '',
          startTime: '',
          endTime: '',
          username: '',
          dateTime: ''
        }
      }
    }
  },
  created() {
    this.getLogList()
  },
  methods: {
    // 获取日志列表
    getLogList() {
      this.listLoading = true
      const queryDateTime = this.listQuery.filters.dateTime
      if (queryDateTime.length === 2 && Array.isArray(queryDateTime)) {
        this.listQuery.filters.startTime = queryDateTime[0]
        this.listQuery.filters.endTime = queryDateTime[1]
      } else {
        this.listQuery.filters.startTime = ''
        this.listQuery.filters.endTime = ''
      }
      const queryDatas = Object.assign(JSON.parse(JSON.stringify(this.listQuery)))
      queryDatas.filters.dateTime = undefined
      logList(queryDatas).then((res) => {
        this.list = res.data.records
        this.total = res.data.total
        this.listLoading = false
      })
    },
    // 隐藏工具栏
    toggleSearch() {
      this.searchToggle = !this.searchToggle
    },
    // 根据条件获取用户列表
    handleFilter() {
      this.listQuery.page = 1
      this.getLogList()
    },
    // 重置搜索
    handleReset() {
      this.$refs.searchForm.resetFields()
      this.handleFilter()
    }
  }
}
</script>

<style>
.crud-opts {
  width: 100%;
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
