<template>
  <div class="app-container">
    <div class="head-container">
      <div>
        <el-input v-model="listQuery.filters.keyword" clearable size="small" placeholder="输入关键字搜索" style="width: 200px" class="filter-item" @keyup.enter.native="handleFilter" />
        <el-select v-model="listQuery.filters.status" clearable size="small" placeholder="状态" style="width: 90px" class="filter-item" @change="handleFilter">
          <el-option v-for="status in statusOptions" :key="status" :label="status | statusFilter" :value="status" />
        </el-select>
        <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="handleFilter"> 搜索 </el-button>
      </div>
      <div class="crud-opts">
        <span class="crud-opts-left">
          <!--左侧插槽-->
          <slot name="left" />
          <el-button v-permission="['comment:create']" class="filter-item" size="mini" type="primary" icon="el-icon-plus"> 新增 </el-button>
          <el-button v-permission="['comment:update']" class="filter-item" size="mini" type="success" icon="el-icon-edit"> 修改 </el-button>
          <el-button v-permission="['comment:delete']" class="filter-item" type="danger" icon="el-icon-delete" size="mini"> 删除 </el-button>
          <!-- <el-button v-permission="['comment:export']" class="filter-item" size="mini" type="warning" icon="el-icon-download" :loading="downloadLoading" @click="handleDownload"> 导出 </el-button> -->
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
    </div>

    <el-table ref="commentTable" :key="tableKey" v-loading="listLoading" :data="list" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="30" />
      <el-table-column label="ID" prop="id" align="center" width="80" />
      <el-table-column label="内容" :show-overflow-tooltip="true">
        <template slot-scope="{ row }">
          <span class="link-type" @click="handleDetail(row)">{{ row.content }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户" prop="author" width="120" />
      <el-table-column label="状态" class-name="status-col" width="80">
        <template slot-scope="{ row }">
          <span> {{ row.status | statusFilter }} </span>
        </template>
      </el-table-column>
      <el-table-column label="评论时间" width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.createTime | parseTime("{y}-{m}-{d} {h}:{i}") }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230">
        <template slot-scope="{ row, $index }">
          <el-button v-permission="['comment:update']" size="mini" type="primary" icon="el-icon-edit" @click="handleUpdate(row)" />
          <el-button v-permission="['comment:audit']" size="mini" type="success" @click="handlePublish(row)"> 审核 </el-button>
          <el-button slot="reference" v-permission="['comment:delete']" size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(row, $index)" />
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getList" />
  </div>
</template>

<script>
import { commentList, auditComment, deleteComment } from '@/api/cms/comment'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

export default {
  name: 'CommentList',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        '-1': '已删除',
        0: '草稿',
        1: '申请发布',
        2: '初审拒绝',
        3: '初审通过',
        4: '终审拒绝',
        5: '已发布'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      tableSelections: [],
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        size: 20,
        filters: {
          keyword: undefined,
          status: undefined
        }
      },
      statusOptions: [-1, 0, 1, 2, 3, 4, 5],
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取文章列表
    getList() {
      this.listLoading = true
      commentList(this.listQuery).then((response) => {
        this.list = response.data.records
        this.total = response.data.total
        this.listLoading = false
      })
    },
    // 根据条件获取文章列表
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },

    handleSelectionChange(val) {
      this.tableSelections = val
    },

    // 发布文章
    handlePublish(row) {
      const publishParams = { id: row.id }
      auditComment(publishParams).then((response) => {
        this.$message({
          message: '发布成功',
          type: 'success'
        })
        row.status = this.statusOptions[6]
      })
    },
    // 删除文章
    handleDelete(row, index) {
      const deleteParams = { id: row.id }
      deleteComment(deleteParams).then((response) => {
        this.$message({
          message: '删除成功',
          type: 'success'
        })
        this.list.splice(index, 1)
      })
    },
    // 文章详情
    handleDetail(row) {
      this.$router.push({
        path: '/cms/commentDetail',
        query: { articleId: row.id }
      })
    },
    // 编辑文章
    handleUpdate(row) {},

    // 导出文章
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then((excel) => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = [
          'timestamp',
          'title',
          'type',
          'importance',
          'status'
        ]
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map((v) =>
        filterVal.map((j) => {
          if (j === 'timestamp') {
            return parseTime(v[j])
          } else {
            return v[j]
          }
        })
      )
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
