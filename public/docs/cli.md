# The openbrowse command

> Every openbrowse subcommand: running the server, managing the systemd service, checking for and installing updates, and tuning the host.

*Source: https://openbrowse.co/docs/cli*

Installing the `openbrowse` package puts a single command on your `PATH`. It is the same command whether OpenBrowse came from PyPI or from a git checkout, and it works from any working directory, because nothing about it depends on where you happen to be standing.

```bash
openbrowse --help
openbrowse --version
```

With no subcommand it prints the help and points at `openbrowse start`, which is what most people want.

## The subcommands

| Command | What it does |
| --- | --- |
| `start` | Registers OpenBrowse as a systemd service, then enables and starts it, so it is running now and again after every reboot |
| `stop` | Stops the service. `--disable` also stops it starting on boot |
| `restart` | Restarts the service |
| `status` | Shows `systemctl status` for the service |
| `serve` | Runs the server in the foreground until you interrupt it |
| `version` | Prints the installed version |
| `check-update` | Asks PyPI whether a newer release exists and says so |
| `update` | Installs the newer release, if there is one |
| `tune` | Sizes the host for OpenBrowse. Linux only, and needs root |

Every one of them exits non-zero on failure, so they compose in a script.

## Running the server

`openbrowse serve` runs in the foreground and is what the systemd unit itself invokes. It takes the bind address and port from your configuration unless you override them:

```bash
openbrowse serve --host 127.0.0.1 --port 9000
```

`--port 0` means an ephemeral port, and is honoured as such rather than being read as "no port given".

`openbrowse start` is the one to reach for on a machine that should keep running it. It needs root to write the unit and enable it, so it asks for your password, and it says in plain words whether OpenBrowse will now come back on boot. Where systemd is absent it says so and falls back to running in the foreground.

The service is covered in full under [running it as a service](https://openbrowse.co/docs/installation#run-it-as-a-service), including what happens when you already have a unit of your own.

## Updates

```bash
openbrowse check-update
openbrowse update
```

`check-update` reports the installed version against the latest on PyPI and exits non-zero only if the check itself failed, so "already up to date" is a success. `update` runs the upgrade through whichever manager owns this copy, `uv tool upgrade`, `pipx upgrade`, pip inside its virtual environment or a `git pull`, and then tells you to restart; unlike the dashboard's button, it does not restart the server for you. Where the owning manager cannot be reached it names the install method and declines rather than running something that would fail. [Updating](https://openbrowse.co/docs/installation#updating) has the full table.

The dashboard does the same two things without a shell: a badge in the navigation when a release is waiting, and a one-click **Install and restart** on the Settings page that is refused while any session is running. [Updating](https://openbrowse.co/docs/installation#updating) covers both paths and the one thing to do afterwards.

## Tuning the host

```bash
openbrowse tune --share most --dry-run
openbrowse tune --share most
```

`--share` takes `all`, `most` or `shared`, matching the three presets the setup screen and the Settings page offer, and `--dry-run` prints the plan without touching anything. The command runs a script bundled inside the package and needs root, so it asks for your password on a host where you are not already root, rather than failing with a traceback.

What it actually writes, and why a Raspberry Pi needs it, is under [sizing it for your machine](https://openbrowse.co/docs/installation#sizing-it-for-your-machine). Run it again after every upgrade: the sudoers grant it writes names the script by its full path, and that path moves with the package.

## Where it reads and writes

Every subcommand resolves one home directory holding `.env` and `data/`: `~/.openbrowse` for an installed copy, the repository root for a checkout, and whatever `OPENBROWSE_HOME` names if it is set. [Where OpenBrowse keeps its files](https://openbrowse.co/docs/installation#where-openbrowse-keeps-its-files) has the detail, including why `OPENBROWSE_HOME` is the one variable that cannot live in `.env`.

There is no walk up from the working directory looking for a `.env` to read, which matters now that the command runs from anywhere: an unrelated project's file can never end up supplying this server's keys.
