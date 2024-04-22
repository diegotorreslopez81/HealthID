import './EditorHeader.css';

class Header {
  api: any;
  readOnly: boolean;
  _CSS: any;
  _settings: any;
  _data: any;
  settingsButtons: any[];
  _element: HTMLHeadingElement;

  constructor({ data, config, api, readOnly }: { data: any; config: object; api: object; readOnly: boolean }) {
    this.api = api;
    this.readOnly = readOnly;

    // eslint-disable-next-line no-underscore-dangle
    this._CSS = {
      block: this.api.styles.block,
      settingsButton: this.api.styles.settingsButton,
      settingsButtonActive: this.api.styles.settingsButtonActive,
      wrapper: 'ce-header',
    };

    /**
     * Tool's settings passed from Editor
     *
     * @type {HeaderConfig}
     * @private
     */
    // eslint-disable-next-line no-underscore-dangle
    this._settings = config;

    /**
     * Block's data
     *
     * @type {object}
     * @private
     */
    // eslint-disable-next-line no-underscore-dangle
    this._data = this.normalizeData(data);

    /**
     * List of settings buttons
     *
     * @type {HTMLElement[]}
     */
    this.settingsButtons = [];

    /**
     * Main Block wrapper
     *
     * @type {HTMLElement}
     * @private
     */
    // eslint-disable-next-line no-underscore-dangle
    this._element = this.getTag();
  }

  /**
   * Normalize input data
   *
   * @param {object} data - saved data to process
   *
   * @returns {object}
   * @private
   */
  normalizeData(data: any): any {
    const newData = {
      text: '',
      level: 0
    };

    if (typeof data !== 'object') {
      // eslint-disable-next-line no-param-reassign
      data = {};
    }

    newData.text = data.text || '';
    // eslint-disable-next-line radix
    newData.level = parseInt(data.level) || this.defaultLevel.number;

    return newData;
  }

  /**
   * Return Tool's view
   *
   * @returns {HTMLHeadingElement}
   * @public
   */
  render(): HTMLHeadingElement {
    // eslint-disable-next-line no-underscore-dangle
    return this._element;
  }

  /**
   * Callback for Block's settings buttons
   *
   * @param {number} level - level to set
   */
  setLevel(level: number) {
    this.data = {
      level,
      text: this.data.text,
    };

    /**
     * Highlight button by selected level
     */
    this.settingsButtons.forEach((button) => {
      button.classList.toggle(
        // eslint-disable-next-line no-underscore-dangle
        this._CSS.settingsButtonActive,
        // eslint-disable-next-line radix
        parseInt(button.dataset.level) === level,
      );
    });
  }

  merge(data: any) {
    const newData = {
      text: this.data.text + data.text,
      level: this.data.level,
    };

    this.data = newData;
  }

  validate(blockData: any): boolean {
    return blockData.text.trim() !== '';
  }

  save(toolsContent: HTMLHeadingElement): object {
    return {
      text: toolsContent.innerHTML,
      level: this.currentLevel.number,
    };
  }

  /**
   * Allow Header to be converted to/from other blocks
   */
  static get conversionConfig() {
    return {
      export: 'text', // use 'text' property for other blocks
      import: 'text', // fill 'text' property from other block's export string
    };
  }

  /**
   * Sanitizer Rules
   */
  static get sanitize() {
    return {
      level: false,
      text: {},
    };
  }

  static get isReadOnlySupported(): boolean {
    return true;
  }

  get data(): any {
    // eslint-disable-next-line no-underscore-dangle
    this._data.text = this._element.innerHTML;
    // eslint-disable-next-line no-underscore-dangle
    this._data.level = this.currentLevel.number;
    // eslint-disable-next-line no-underscore-dangle
    return this._data;
  }

  set data(data: any) {
    // eslint-disable-next-line no-underscore-dangle
    this._data = this.normalizeData(data);

    /**
     * If level is set and block in DOM
     * then replace it to a new block
     */
    // eslint-disable-next-line no-underscore-dangle
    if (data.level !== undefined && this._element.parentNode) {
      /**
       * Create a new tag
       *
       * @type {HTMLHeadingElement}
       */
      const newHeader: HTMLHeadingElement = this.getTag();

      /**
       * Save Block's content
       */
      // eslint-disable-next-line no-underscore-dangle
      newHeader.innerHTML = this._element.innerHTML;

      /**
       * Replace blocks
       */
      // eslint-disable-next-line no-underscore-dangle
      this._element.parentNode.replaceChild(newHeader, this._element);

      /**
       * Save new block to private variable
       *
       * @type {HTMLHeadingElement}
       * @private
       */
      // eslint-disable-next-line no-underscore-dangle
      this._element = newHeader;
    }

    /**
     * If data.text was passed then update block's content
     */
    if (data.text !== undefined) {
      // eslint-disable-next-line no-underscore-dangle
      this._element.innerHTML = this._data.text || '';
    }
  }

  /**
   * Get tag for target level
   * By default returns second-leveled header
   *
   * @returns {HTMLElement}
   */
  getTag(): HTMLHeadingElement {
    /**
     * Create element for current Block's level
     */
    const tag = document.createElement(this.currentLevel.tag);

    /**
     * Add text to block
     */
    // eslint-disable-next-line no-underscore-dangle
    tag.innerHTML = this._data.text || '';

    /**
     * Add styles class
     */
    // eslint-disable-next-line no-underscore-dangle
    tag.classList.add(this._CSS.wrapper);
    const cssIds = ['', 'h1', 'h2', 'h3'];
    tag.id = cssIds[this.currentLevel.number];

    /**
     * Make tag editable
     */
    tag.contentEditable = this.readOnly ? 'false' : 'true';

    /**
     * Add Placeholder
     */
    // eslint-disable-next-line no-underscore-dangle
    tag.dataset.placeholder = this.api.i18n.t(this._settings.placeholder || '');

    return tag;
  }

  /**
   * Get current level
   *
   * @returns {level}
   */
  get currentLevel(): any {
    let level = this.levels.find(
      // eslint-disable-next-line no-underscore-dangle
      (levelItem) => levelItem.number === this._data.level,
    );

    if (!level) {
      level = this.defaultLevel;
    }

    return level;
  }

  /**
   * Return default level
   *
   * @returns {level}
   */
  get defaultLevel(): any {
    /**
     * User can specify own default level value
     */
    // eslint-disable-next-line no-underscore-dangle
    if (this._settings.defaultLevel) {
      const userSpecified = this.levels.find((levelItem) => {
        // eslint-disable-next-line no-underscore-dangle
        return levelItem.number === this._settings.defaultLevel;
      });

      if (userSpecified) {
        return userSpecified;
      }
      console.warn(
        'Heading Tool: the default level specified was not found in available levels',
      );
    }

    /**
     * With no additional options, there will be H2 by default
     *
     * @type {level}
     */
    return this.levels[0];
  }

  get levels(): { number: number, tag: string, svg: string }[] {
    const availableLevels = [
      {
        number: 1,
        tag: 'H2',
        svg: '<svg width="16" height="14" xmlns="http://www.w3.org/2000/svg"><path d="M2.14 1.494V4.98h4.62V1.494c0-.498.098-.871.293-1.12A.927.927 0 0 1 7.82 0c.322 0 .583.123.782.37.2.246.3.62.3 1.124v9.588c0 .503-.101.88-.303 1.128a.957.957 0 0 1-.779.374.921.921 0 0 1-.77-.378c-.193-.251-.29-.626-.29-1.124V6.989H2.14v4.093c0 .503-.1.88-.302 1.128a.957.957 0 0 1-.778.374.921.921 0 0 1-.772-.378C.096 11.955 0 11.58 0 11.082V1.494C0 .996.095.623.285.374A.922.922 0 0 1 1.06 0c.321 0 .582.123.782.37.199.246.299.62.299 1.124zm11.653 9.985V5.27c-1.279.887-2.14 1.33-2.583 1.33a.802.802 0 0 1-.563-.228.703.703 0 0 1-.245-.529c0-.232.08-.402.241-.511.161-.11.446-.25.854-.424.61-.259 1.096-.532 1.462-.818a5.84 5.84 0 0 0 .97-.962c.282-.355.466-.573.552-.655.085-.082.246-.123.483-.123.267 0 .481.093.642.28.161.186.242.443.242.77v7.813c0 .914-.345 1.371-1.035 1.371-.307 0-.554-.093-.74-.28-.187-.186-.28-.461-.28-.825z"/></svg>',
      },
      {
        number: 2,
        tag: 'H3',
        svg: '<svg width="18" height="14" xmlns="http://www.w3.org/2000/svg"><path d="M2.152 1.494V4.98h4.646V1.494c0-.498.097-.871.293-1.12A.934.934 0 0 1 7.863 0c.324 0 .586.123.786.37.2.246.301.62.301 1.124v9.588c0 .503-.101.88-.304 1.128a.964.964 0 0 1-.783.374.928.928 0 0 1-.775-.378c-.194-.251-.29-.626-.29-1.124V6.989H2.152v4.093c0 .503-.101.88-.304 1.128a.964.964 0 0 1-.783.374.928.928 0 0 1-.775-.378C.097 11.955 0 11.58 0 11.082V1.494C0 .996.095.623.286.374A.929.929 0 0 1 1.066 0c.323 0 .585.123.786.37.2.246.3.62.3 1.124zm10.99 9.288h3.527c.351 0 .62.072.804.216.185.144.277.34.277.588 0 .22-.073.408-.22.56-.146.154-.368.23-.665.23h-4.972c-.338 0-.601-.093-.79-.28a.896.896 0 0 1-.284-.659c0-.162.06-.377.182-.645s.255-.478.399-.631a38.617 38.617 0 0 1 1.621-1.598c.482-.444.827-.735 1.034-.875.369-.261.676-.523.922-.787.245-.263.432-.534.56-.81.129-.278.193-.549.193-.815 0-.288-.069-.546-.206-.773a1.428 1.428 0 0 0-.56-.53 1.618 1.618 0 0 0-.774-.19c-.59 0-1.054.26-1.392.777-.045.068-.12.252-.226.554-.106.302-.225.534-.358.696-.133.162-.328.243-.585.243a.76.76 0 0 1-.56-.223c-.149-.148-.223-.351-.223-.608 0-.31.07-.635.21-.972.139-.338.347-.645.624-.92a3.093 3.093 0 0 1 1.054-.665c.426-.169.924-.253 1.496-.253.69 0 1.277.108 1.764.324.315.144.592.343.83.595.24.252.425.544.558.875.133.33.2.674.2 1.03 0 .558-.14 1.066-.416 1.523-.277.457-.56.815-.848 1.074-.288.26-.771.666-1.45 1.22-.677.554-1.142.984-1.394 1.29a3.836 3.836 0 0 0-.331.44z"/></svg>',
      },
      {
        number: 3,
        tag: 'H4',
        svg: '<svg width="18" height="14" xmlns="http://www.w3.org/2000/svg"><path d="M2.152 1.494V4.98h4.646V1.494c0-.498.097-.871.293-1.12A.934.934 0 0 1 7.863 0c.324 0 .586.123.786.37.2.246.301.62.301 1.124v9.588c0 .503-.101.88-.304 1.128a.964.964 0 0 1-.783.374.928.928 0 0 1-.775-.378c-.194-.251-.29-.626-.29-1.124V6.989H2.152v4.093c0 .503-.101.88-.304 1.128a.964.964 0 0 1-.783.374.928.928 0 0 1-.775-.378C.097 11.955 0 11.58 0 11.082V1.494C0 .996.095.623.286.374A.929.929 0 0 1 1.066 0c.323 0 .585.123.786.37.2.246.3.62.3 1.124zm11.61 4.919c.418 0 .778-.123 1.08-.368.301-.245.452-.597.452-1.055 0-.35-.12-.65-.36-.902-.241-.252-.566-.378-.974-.378-.277 0-.505.038-.684.116a1.1 1.1 0 0 0-.426.306 2.31 2.31 0 0 0-.296.49c-.093.2-.178.388-.255.565a.479.479 0 0 1-.245.225.965.965 0 0 1-.409.081.706.706 0 0 1-.5-.22c-.152-.148-.228-.345-.228-.59 0-.236.071-.484.214-.745a2.72 2.72 0 0 1 .627-.746 3.149 3.149 0 0 1 1.024-.568 4.122 4.122 0 0 1 1.368-.214c.44 0 .842.06 1.205.18.364.12.679.294.947.52.267.228.47.49.606.79.136.3.204.622.204.967 0 .454-.099.843-.296 1.168-.198.324-.48.64-.848.95.354.19.653.408.895.653.243.245.426.516.548.813.123.298.184.619.184.964 0 .413-.083.812-.248 1.198-.166.386-.41.73-.732 1.031a3.49 3.49 0 0 1-1.147.708c-.443.17-.932.256-1.467.256a3.512 3.512 0 0 1-1.464-.293 3.332 3.332 0 0 1-1.699-1.64c-.142-.314-.214-.573-.214-.777 0-.263.085-.475.255-.636a.89.89 0 0 1 .637-.242c.127 0 .25.037.367.112a.53.53 0 0 1 .232.27c.236.63.489 1.099.759 1.405.27.306.65.46 1.14.46a1.714 1.714 0 0 0 1.46-.824c.17-.273.256-.588.256-.947 0-.53-.145-.947-.436-1.249-.29-.302-.694-.453-1.212-.453-.09 0-.231.01-.422.028-.19.018-.313.027-.367.027-.25 0-.443-.062-.579-.187-.136-.125-.204-.299-.204-.521 0-.218.081-.394.245-.528.163-.134.406-.2.728-.2h.28z"/></svg>',
      },
    ];
    // eslint-disable-next-line no-underscore-dangle
    return this._settings.levels
      ? availableLevels.filter(
        // eslint-disable-next-line no-underscore-dangle
        (l) => this._settings.levels.includes(l.number),
      )
      : availableLevels;
  }

  /**
   * Handle H1-H6 tags on paste to substitute it with header Tool
   *
   * @param {PasteEvent} event - event with pasted content
   */
  onPaste(event: any) {
    const content = event.detail.data;

    /**
     * Define default level value
     *
     * @type {number}
     */
    let level: number = this.defaultLevel.number;

    switch (content.tagName) {
      case 'H2':
        level = 1;
        break;
      case 'H3':
        level = 2;
        break;
      case 'H4':
        level = 3;
        break;
      default:
        level = 1;
        break;
    }
    // eslint-disable-next-line no-underscore-dangle
    if (this._settings.levels) {
      // Fallback to nearest level when specified not available
      // eslint-disable-next-line no-underscore-dangle
      level = this._settings.levels.reduce((prevLevel: number, currLevel: number) => {
        return Math.abs(currLevel - level) < Math.abs(prevLevel - level)
          ? currLevel
          : prevLevel;
      });
    }

    this.data = {
      level,
      text: content.innerHTML,
    };
  }

  /**
   * Used by Editor.js paste handling API.
   * Provides configuration to handle H1-H6 tags.
   *
   * @returns {{handler: (function(HTMLElement): {text: string}), tags: string[]}}
   */
  static get pasteConfig(): { tags: string[] } {
    return {
      tags: ['H2', 'H3', 'H4'],
    };
  }

  /**
   * Get Tool toolbox settings
   * icon - Tool icon's SVG
   * title - title to show in toolbox
   *
   * @returns {{icon: string, title: string}}
   */
  static get toolbox(): { icon: string; title: string; data: { level: number } }[] {
    const icon =
      '<svg width="10" height="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 14"><path d="M7.6 8.15H2.25v4.525a1.125 1.125 0 0 1-2.25 0V1.125a1.125 1.125 0 1 1 2.25 0V5.9H7.6V1.125a1.125 1.125 0 0 1 2.25 0v11.55a1.125 1.125 0 0 1-2.25 0V8.15z"/></svg>';
    return [
      {
        icon,
        title: 'Heading 1',
        data: {
          level: 1,
        },
      },
      {
        icon,
        title: 'Heading 2',
        data: {
          level: 2,
        },
      },
      {
        icon,
        title: 'Heading 3',
        data: {
          level: 3,
        },
      },
    ];
  }
}

export default Header;
