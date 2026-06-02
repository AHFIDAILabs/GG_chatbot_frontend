// Allow CSS files to be imported (both named and side-effect imports)
declare module '*.css' {
  const styles: { readonly [className: string]: string };
  export default styles;
}
