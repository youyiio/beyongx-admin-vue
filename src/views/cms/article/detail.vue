<template>
  <el-container :data="record">
    <el-header prop="title">{{ record.title }}</el-header>
    <el-divider content-position="left">
      <span>作者：{{ record.author }}</span>
      <el-divider direction="vertical" />
      <span>发布时间：{{ record.postTime }}</span>
    </el-divider>
    <el-main><div v-html="record.content" /></el-main>
    <el-divider><i class="el-icon-reading" /></el-divider>
    <el-footer>
      <span>阅读量：{{ record.readCount }}</span>
      <el-divider direction="vertical" />
      <span>评论量：{{ record.commentCount }}</span>
    </el-footer>
  </el-container>
</template>

<script>
import { articleDetail } from '@/api/cms/article'

export default {
  name: 'ArticleDetail',
  data() {
    return {
      record: ''
    }
  },
  created() {
    this.getArticle()
  },
  methods: {
    getArticle() {
      const articleId = this.$route.query.articleId
      articleDetail(articleId).then((res) => {
        this.record = res.data
      })
    }
  }
}
</script>

<style scoped>
.el-header {
  text-align: center;
  line-height: 60px;
}

.el-main {
  padding: 0px 50px;
}

body > .el-container {
  margin-bottom: 40px;
}
</style>
