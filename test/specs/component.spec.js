import Vue from 'vue'

import GetTextPlugin from '../../src/'
import translations from './json/component.json'


describe('translate component tests', () => {

  beforeEach(function () {
    GetTextPlugin.installed = false
    Vue.use(GetTextPlugin, {
      availableLanguages: {
        en_US: 'American English',
        fr_FR: 'Français',
      },
      defaultLanguage: 'en_US',
      translations: translations,
    })
  })

  it('works on empty strings', () => {
    let vm = new Vue({template: '<div><translate></translate></div>'}).$mount()
    expect(vm.$el.innerHTML.trim()).to.equal('<span></span>')
  })

  it('returns an unchanged string when no translation is available for a language', () => {
    console.warn = sinon.spy(console, 'warn')
    let vm = new Vue({template: '<div><translate>Unchanged string</translate></div>'}).$mount()
    vm.$language.current = 'fr_BE'
    expect(vm.$el.innerHTML.trim()).to.equal('<span>Unchanged string</span>')
    expect(console.warn).calledOnce
    console.warn.restore()
  })

  it('returns an unchanged string when no translation key is available', () => {
    console.warn = sinon.spy(console, 'warn')
    let vm = new Vue({template: '<div><translate>Untranslated string</translate></div>'}).$mount()
    expect(vm.$el.innerHTML.trim()).to.equal('<span>Untranslated string</span>')
    expect(console.warn).calledOnce
    console.warn.restore()
  })

  it('translates known strings', () => {
    Vue.config.language = 'fr_FR'
    let vm = new Vue({template: '<div><translate>Pending</translate></div>'}).$mount()
    expect(vm.$el.innerHTML.trim()).to.equal('<span>En cours</span>')
  })

  it('translates multiline strings no matter the number of spaces', () => {
    Vue.config.language = 'fr_FR'
    let vm = new Vue({template: `<div><translate tag="p">
                  A


                  lot




                  of

                  lines
    </translate></div>`}).$mount()
    expect(vm.$el.innerHTML.trim()).to.equal(`<p>Plein de lignes</p>`)
  })

  it('renders translation in custom html tag', () => {
    Vue.config.language = 'fr_FR'
    let vm = new Vue({template: '<div><translate tag="h1">Pending</translate></div>'}).$mount()
    expect(vm.$el.innerHTML.trim()).to.equal('<h1>En cours</h1>')
  })

  it('translates known strings according to a given translation context', () => {
    Vue.config.language = 'en_US'
    let vm = new Vue({template: '<div><translate translate-context="Verb">Answer</translate></div>'}).$mount()
    expect(vm.$el.innerHTML.trim()).to.equal('<span>Answer (verb)</span>')
    vm = new Vue({template: '<div><translate translate-context="Noun">Answer</translate></div>'}).$mount()
    expect(vm.$el.innerHTML.trim()).to.equal('<span>Answer (noun)</span>')
  })

  it('allows interpolation', () => {
    Vue.config.language = 'fr_FR'
    let vm = new Vue({
      template: '<p><translate>Hello %{ name }</translate></p>',
      data: {name: 'John Doe'},
    }).$mount()
    expect(vm.$el.innerHTML.trim()).to.equal('<span>Bonjour John Doe</span>')
  })

  it('allows interpolation with computed property', () => {
    Vue.config.language = 'fr_FR'
    let vm = new Vue({
      template: '<p><translate>Hello %{ name }</translate></p>',
      computed: {
        name () { return 'John Doe' },
      },
    }).$mount()
    expect(vm.$el.innerHTML.trim()).to.equal('<span>Bonjour John Doe</span>')
  })

  it('translates plurals', () => {
    Vue.config.language = 'fr_FR'
    let vm = new Vue({
      template: `<p>
        <translate :translate-n="count" translate-plural="%{ count } cars">%{ count } car</translate>
      </p>`,
      data: {count: 2},
    }).$mount()
    expect(vm.$el.innerHTML.trim()).to.equal('<span>2 véhicules</span>')
  })

  it('translates plurals with computed property', () => {
    Vue.config.language = 'fr_FR'
    let vm = new Vue({
      template: `<p>
        <translate :translate-n="count" translate-plural="%{ count } cars">%{ count } car</translate>
      </p>`,
      computed: {
        count () { return 2 },
      },
    }).$mount()
    expect(vm.$el.innerHTML.trim()).to.equal('<span>2 véhicules</span>')
  })

  it('updates a plural translation after a data change', (done) => {
    Vue.config.language = 'fr_FR'
    let vm = new Vue({
      template: `<p>
        <translate :translate-n="count" translate-plural="%{ count } cars">%{ count } car</translate>
      </p>`,
      data: {count: 10},
    }).$mount()
    expect(vm.$el.innerHTML.trim()).to.equal('<span>10 véhicules</span>')
    vm.count = 8
    vm.$nextTick(function () {
      expect(vm.$el.innerHTML.trim()).to.equal('<span>8 véhicules</span>')
      done()
    })
  })

  it('updates a translation after a language change', (done) => {
    Vue.config.language = 'fr_FR'
    let vm = new Vue({template: '<div><translate>Pending</translate></div>'}).$mount()
    expect(vm.$el.innerHTML.trim()).to.equal('<span>En cours</span>')
    Vue.config.language = 'en_US'
    vm.$nextTick(function () {
      expect(vm.$el.innerHTML.trim()).to.equal('<span>Pending</span>')
      done()
    })
  })

  // TODO: understand why PhantomJS keeps on crashing?
  // it('throws an error if you forget to add a `translate-plural` attribute', () => {
  //   expect(function () {
  //     return new Vue({
  //       template: '<span><translate :translate-n="n">%{ n } car</translate></span>',
  //       data: {n: 2},
  //     }).$mount()
  //   }).to.throw('`translate-n` and `translate-plural` attributes must be used together: %{ n } car.')
  // })

  // TODO: understand why PhantomJS keeps on crashing?
  // it('throws an error if you forget to add a `translate-n` attribute', () => {
  //   expect(function () {
  //     return new Vue({
  //       template: '<p><translate translate-plural="%{ n }} cars">%{ n } car</translate></p>',
  //     }).$mount()
  //   }).to.throw('`translate-n` and `translate-plural` attributes must be used together: %{ n } car.')
  // })

})
