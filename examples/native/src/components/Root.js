import React, { Component, Fragment } from 'react'
import { SafeAreaView, Alert, Text, View, Image, TextInput } from 'react-native'
import { ScrollView } from 'react-navigation'
import uuid from 'uuid'
import { synchronize } from '@nozbe/watermelondb/sync'

import { generate100, generate10k } from '../models/generate'
import Button from './helpers/Button'
import styles from './helpers/styles'
import BlogList from './BlogList'

import logoSrc from './assets/logo-app.png'

class Root extends Component {
  state = {
    isGenerating: false,
    search: '',
    isSearchFocused: false,
  }

  simulateSync = async () => {
    const blogId = uuid()

    const pullDataResponse = {
      blogs: {
        created: [{
          id: blogId,
          name: 'A blog'
        }],
        deleted: [],
        updated: []
      },
      posts: {
        created: [],
        deleted: [],
        updated: []
      },
      comments: {
        created: [],
        deleted: [],
        updated: []
      }
    }

    /**
     * Simulate 1k posts, each with 50 comments = 50,000 comment rows
     */

    for(i = 0; i < 1000; i++) {
      const postId = uuid()

      pullDataResponse.posts.created.push({
        id: postId,
        blog_id: blogId,
        title: `Post ${i}`,
        subtitle: 'Some subtitle',
        body: 'Some body'
      })

      for(k = 0; k < 50; k++) {
        pullDataResponse.comments.created.push({
          id: uuid(),
          post_id: postId,
          body: 'Some comment',
          is_nasty: false
        })
      }
    }

    const db = this.props.database

    await db.action(() => db.unsafeResetDatabase())

    await synchronize({
      _unsafeBatchPerCollection: true,
      database: this.props.database,
      pullChanges: async ({ lastPulledAt }) => {
        console.log('pull changes', lastPulledAt, {
          changes: pullDataResponse,
          timestamp: (new Date()).getTime()
        })

        return {
          changes: pullDataResponse,
          timestamp: (new Date()).getTime()
        }
      },
      pushChanges: async ({ changes, lastPulledAt }) => {
        console.log('push changes')
      },
    })
  }

  render() {
    const { search, isGenerating, isSearchFocused } = this.state
    const { database, navigation, timeToLaunch } = this.props

    return (
      <ScrollView>
        <SafeAreaView>
          {!isSearchFocused && (
            <Fragment>
              <Image style={styles.logo} source={logoSrc} />
              <Text style={styles.post}>Launch time: {timeToLaunch} ms</Text>
              <View style={styles.marginContainer}>
                <Text style={styles.header}>Generate:</Text>
                <View style={styles.buttonContainer}>
                  <Button title="Simulate sync" onPress={this.simulateSync} />
                </View>
              </View>
            </Fragment>
          )}
        </SafeAreaView>
      </ScrollView>
    )
  }
}

export default Root
