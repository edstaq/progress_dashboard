{ pkgs, ... }: {
  channel = "stable-24.05";
  packages = [
    pkgs.nodejs
  ];
  env = {};
  idx = {
    extensions = [];
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npx" "-y" "http-server" "-p" "$PORT"];
          manager = "web";
        };
      };
    };
    workspace = {
      onCreate = {};
      onStart = {};
    };
  };
}
