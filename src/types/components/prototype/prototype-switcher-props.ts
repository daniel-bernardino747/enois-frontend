/** PROTÓTIPO: barra flutuante que troca a variação pela URL. */
export type PrototypeSwitcherProps = {
  variants: { key: string; name: string }[];
  current: string;
  onChange: (key: string) => void;
};
