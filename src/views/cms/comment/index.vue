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
      <div class="crud-opts">
        <span class="crud-opts-left">
          <el-button v-permission="['comment:audit']" class="filter-item" size="mini" type="success" icon="el-icon-thumb" :disabled="auditable" @click="handleAudit(commentSelections)"> 审核 </el-button>
          <el-popconfirm v-permission="['comment:delete']" :title="`确认删除所选${commentSelections.length}条数据吗？`" @onConfirm="handleDelete(commentSelections)">
            <el-button slot="reference" class="filter-item" type="danger" icon="el-icon-delete" size="mini" :disabled="deleteable"> 删除 </el-button>
          </el-popconfirm>
        </span>
        <el-button-group class="crud-opts-right">
          <el-button size="mini" plain type="info" icon="el-icon-search" @click="toggleSearch()" />
          <el-button size="mini" icon="el-icon-refresh" @click="getCommentList()" />
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
      <el-table-column type="selection" width="50" />
      <el-table-column label="ID" prop="id" align="center" width="80" />
      <el-table-column label="内容" :show-overflow-tooltip="true">
        <template slot-scope="{ row }">
          <span class="link-type">{{ row.content }}</span>
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
          <span>{{ row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230">
        <template slot-scope="{ row, $index }">
          <el-button v-permission="['comment:audit']" size="mini" type="success" :disabled="row.status === statusOptions[4]" @click="handleAudit(row)"> 审核 </el-button>
          <el-popconfirm v-permission="['comment:delete']" title="确认删除本条数据吗？" @onConfirm="handleDelete(row, $index)">
            <el-button slot="reference" size="mini" type="danger" icon="el-icon-delete" :disabled="row.status === statusOptions[0]" />
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.size" @pagination="getCommentList()" />
  </div>
</template>

<script>
import { commentList, commentAudit, commentDelete } from '@/api/cms/comment'
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
        2: '拒绝',
        3: '已发布'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      searchToggle: true,
      tableKey: 0,
      auditable: true,
      deleteable: true,
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
      statusOptions: [-1, 0, 1, 2, 3],
      downloadLoading: false
    }
  },
  created() {
    this.getCommentList()
  },
  methods: {
    // 获取文章列表
    getCommentList() {
      this.listLoading = true
      commentList(this.listQuery).then((response) => {
        this.list = response.data.records
        this.total = response.data.total
        this.listLoading = false
      })
    },
    // 隐藏工具栏
    toggleSearch() {
      this.searchToggle = !this.searchToggle
    },
    // 根据条件获取文章列表
    handleFilter() {
      this.listQuery.page = 1
      this.getCommentList()
    },
    // 重置搜索
    handleReset() {
      this.$refs.searchForm.resetFields()
      this.getCommentList()
    },

    handleSelectionChange(val) {
      this.deleteable = false
      this.auditable = false
      val.forEach(element => {
        if (element.status === this.statusOptions[0]) {
          this.deleteable = true
        }
        if (element.status === this.statusOptions[4]) {
          this.auditable = true
        }
      })
      this.commentSelections = val
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
          this.getCommentList()
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
          this.getCommentList()
        } else {
          this.list.splice(index, 1)
        }
      })
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
