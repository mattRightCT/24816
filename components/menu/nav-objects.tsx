

export type NavObject = {
  href: string,
  text: string
};

export const NavObjects: NavObject[] = [
  {
    href: '/',
    text: 'Current Game'
  },
  {
    href: '/settings',
    text: 'Settings'
  },
  {
    href: '/editor',
    text: 'Board Editor'
  },
  {
    href: '/scores',
    text: 'Score Data'
  }
];
