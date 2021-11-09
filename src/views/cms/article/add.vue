<template>
  <div class="app-container">
    <el-row>
      <el-col>
        <el-card class="box-card" shadow="never">
          <div slot="header" class="clearfix">
            <span class="role-span">新增文章</span>
          </div>
          <div class="createPost-container">
            <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container">
              <el-form-item label="所属分类">
                <el-input />
              </el-form-item>
              <el-form-item prop="content" style="margin-bottom: 30px;">
                <Tinymce ref="editor" :height="400" />
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import Tinymce from '@/components/Tinymce'

export default {
  name: 'ArticleCreate',
  components: { Tinymce },
  data() {
    return {
      postForm: {},
      rules: {
        content: []
      }
    }
  }
}
</script>
