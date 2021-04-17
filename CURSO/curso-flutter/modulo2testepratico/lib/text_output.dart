import 'package:flutter/material.dart';

class Text_Output extends StatelessWidget {
  final String mainText;

  Text_Output(this.mainText);

  @override
  Widget build(BuildContext context) {
    return Text(mainText);
  }
}
