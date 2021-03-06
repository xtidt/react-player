import React from 'react'
import test from 'ava'
import sinon from 'sinon'
import { configure, shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import testPlayerMethods from '../helpers/testPlayerMethods'
import * as utils from '../../src/utils'
import { Facebook } from '../../src/players/Facebook'

configure({ adapter: new Adapter() })

const TEST_URL = 'https://www.facebook.com/facebook/videos/10153231379946729'
const TEST_CONFIG = {
  facebook: {
    appId: '123'
  }
}

Facebook.prototype.componentWillMount = function () {
  this.playerID = 'mock-player-id'
}

testPlayerMethods(Facebook, {
  play: 'play',
  pause: 'pause',
  stop: null,
  seekTo: 'seek',
  setVolume: 'setVolume',
  mute: 'mute',
  unmute: 'unmute',
  getDuration: 'getDuration',
  getCurrentTime: 'getCurrentPosition',
  getSecondsLoaded: null
})

test('load()', async t => {
  const FB = {
    init: () => null,
    Event: {
      subscribe: (event, fn) => {
        fn({
          type: 'video',
          id: 'mock-player-id',
          instance: {
            subscribe: () => null,
            unmute: () => null
          }
        })
      }
    }
  }
  const getSDK = sinon.stub(utils, 'getSDK').resolves(FB)
  const onReady = () => t.pass()
  const instance = shallow(<Facebook config={TEST_CONFIG} onReady={onReady} />).instance()
  instance.load(TEST_URL)
  t.true(getSDK.calledOnce)
  getSDK.restore()
})

test('load() when ready', async t => {
  const FB = {
    XFBML: {
      parse: () => t.pass()
    }
  }
  const getSDK = sinon.stub(utils, 'getSDK').resolves(FB)
  const onReady = () => t.pass()
  const instance = shallow(<Facebook config={TEST_CONFIG} onReady={onReady} />).instance()
  instance.load(TEST_URL, true)
  t.true(getSDK.calledOnce)
  getSDK.restore()
})

test('render()', t => {
  const style = {
    width: '100%',
    height: '100%',
    backgroundColor: 'black'
  }
  const wrapper = shallow(<Facebook url={TEST_URL} />)
  t.true(wrapper.contains(
    <div
      style={style}
      id='mock-player-id'
      className='fb-video'
      data-href={TEST_URL}
      data-autoplay='false'
      data-allowfullscreen='true'
      data-controls='false'
    />
  ))
})
