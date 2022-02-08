<template>
  <div class="app-container">
    <div class="head-container">
      <div v-if="searchToggle">
        <el-form ref="searchForm" :model="listQuery.filters" :inline="true">
          <el-form-item prop="keyword">
            <el-input v-model="listQuery.filters.keyword" clearable size="small" placeholder="输入关键字搜索" style="width: 200px" class="filter-item" @keyup.enter.native="handleFilter" />
          </el-form-item>
          <el-form-item prop="status">
            <el-select v-model="listQuery.filters.status" clearable size="small" placeholder="状态" style="width: 90px" class="filter-item">
              <el-option v-for="status in statusOptions" :key="status" :label="status | statusFilter" :value="status" />
            </el-select>
          </el-form-item>
          <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="handleFilter()"> 搜索 </el-button>
          <el-button class="filter-item" size="mini" type="warning" icon="el-icon-refresh-left" @click="handleReset()">重置</el-button>
        </el-form>
      </div>
      <Toolbar :opt-show="optShow" :selections="commentSelections" :is-batch="true" :permission="permissions" :table-columns="tableColumns">
        <el-button slot="middle-2" v-permission="permissions.audit" class="filter-item" size="mini" type="success" icon="el-icon-thumb" :disabled="auditable" @click="handleAudit(commentSelections)"> 审核 </el-button>
      </Toolbar>
    </div>

    <el-table ref="commentTable" :key="tableKey" v-loading="listLoading" :data="list" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" />
      <el-table-column label="ID" prop="id" align="center" width="80" />
      <el-table-column v-if="tableColumns.content.visible" label="内容" :show-overflow-tooltip="true">
        <template slot-scope="{ row }">
          <span class="link-type">{{ row.content }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="tableColumns.author.visible" label="用户" prop="author" width="120" />
      <el-table-column v-if="tableColumns.status.visible" label="状态" class-name="status-col" width="80">
        <template slot-scope="{ row }">
          <span> {{ row.status | statusFilter }} </span>
        </template>
      </el-table-column>
      <el-table-column v-if="tableColumns.createTime.visible" label="评论时间" width="150px" align="center">
        <template slot-scope="{ row }">
          <span>{{ row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230">
        <template slot-scope="{ row, $index }">
          <el-button v-permission="['comment:audit']" size="mini" type="success" :disabled="row.status === statusOptions[4]" @click="handleAudit(row)"> 审核 </el-button>
          <el-popconfirm v-permission="['comment:delete']" style="margin-left: 10px" title="确认删除本条数据吗？" @confirm="handleDelete(row, $index)">
            <el-button slot="reference" size="mini" type="danger" icon="el-icon-delete" :disabled="row.status === statusOptions[0]" />
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getTableList()" />
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import { commentList, commentAudit, commentDelete } from '@/api/cms/comment'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const defaultTableColumns = {
  content: { title: '内容', visible: true },
  author: { title: '作者', visible: true },
  status: { title: '状态', visible: true },
  createTime: { title: '评论时间', visible: true }
}

export default {
  name: 'CommentIndex',
  components: { Toolbar, Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        '-1': '已删除',
        0: '草稿',
        1: '申请发布',
        2: '拒绝',
        3: '已发布'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      optShow: {
        create: false,
        update: false,
        delete: true,
        download: false
      },
      permissions: {
        audit: ['comment:audit'],
        delete: ['comment:delete']
      },
      searchToggle: true,
      tableColumns: Object.assign(JSON.parse(JSON.stringify(defaultTableColumns))),
      tableKey: 0,
      auditable: true,
      commentSelections: [],
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
      statusOptions: [-1, 0, 1, 2, 3]
    }
  },
  created() {
    this.getTableList()
  },
  methods: {
    // 获取文章列表
    getTableList() {
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
      this.getTableList()
    },
    // 重置搜索
    handleReset() {
      this.$refs.searchForm.resetFields()
      this.getTableList()
    },

    handleSelectionChange(val) {
      this.commentSelections = val
      this.auditable = !(this.commentSelections.length > 0)
      const findStatus = val.some(item => item.status === this.statusOptions[4])
      if (findStatus) {
        this.auditable = true
      }
    },

    // 审核文章
    handleAudit(row) {
      const auditParams = {}
      const auditIds = []
      if (Array.isArray(row)) {
        for (const item of row) {
          auditIds.push(item.id)
        }
        auditParams.ids = auditIds
      } else {
        auditParams.id = row.id
      }
      // auditParams.audit = 'pass'
      commentAudit(auditParams).then((res) => {
        this.$message({
          message: '审核成功',
          type: 'success'
        })
        if (Array.isArray(row)) {
          this.getTableList()
        } else {
          row.status = this.statusOptions[4]
        }
      })
    },
    // 删除文章
    handleDelete(row, index) {
      const deleteParams = {}
      const commentIds = []
      if (Array.isArray(row)) {
        for (const item of row) {
          commentIds.push(item.id)
        }
        deleteParams.ids = commentIds
      } else {
        deleteParams.id = row.id
      }
      commentDelete(deleteParams).then((response) => {
        this.$message({
          message: '删除成功',
          type: 'success'
        })
        if (Array.isArray(row)) {
          this.getTableList()
        } else {
          this.list.splice(index, 1)
        }
      })
    }

  }
}
</script>
