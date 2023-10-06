declare module 'did-method-generic' {
  function driver(
    options: {
      method: string,
      service: Array<Object>
    }
  ): { generate: function }  {}
};