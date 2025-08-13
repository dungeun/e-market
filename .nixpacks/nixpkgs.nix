{ pkgs ? import <nixpkgs> {} }:

with pkgs;

[
  nodejs_18
  nodePackages.npm
  nodePackages.yarn
  python3
]