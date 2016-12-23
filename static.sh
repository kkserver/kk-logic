#/bin/sh

WORKDIR=`pwd`

exitCommand() {
	exit $1
}

runCommand() {
	echo $CMD
	$CMD
	if [ $? -ne 0 ]; then
		echo -e "[FAIL] $CMD"
		exitCommand 3
	fi 
}

buildProject() {

	#static compressor

	if [ -d "$HOME/.kk-shell" ]; then
		cd "$HOME/.kk-shell"
		git pull origin master
		cd $WORKDIR
	else
		git clone http://github.com/kkserver/kk-shell $HOME/.kk-shell
		chmod +x $HOME/.kk-shell/web/build.sh
		chmod +x $HOME/.kk-shell/web/view.py
	fi

	CMD="$HOME/.kk-shell/web/build.sh"
	runCommand

}

echo $WORKDIR

buildProject

#exit

exitCommand

