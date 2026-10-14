import 'package:flutter/material.dart';

import '../../001_core/theme/001_CORE_spacing.dart';

/// Thẻ trắng có viền — đơn vị bố cục cơ bản của mọi màn.
class AppCard extends StatelessWidget {
  const AppCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(AppSpace.l),
    this.margin,
    this.onTap,
    this.semanticLabel,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final EdgeInsetsGeometry? margin;
  final VoidCallback? onTap;
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final content = Container(
      padding: padding,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppRadius.cardAll,
      ),
      child: child,
    );

    return Container(
      margin: margin,
      decoration: BoxDecoration(
        borderRadius: AppRadius.cardAll,
        border: Border.all(color: Theme.of(context).colorScheme.outline),
      ),
      clipBehavior: Clip.antiAlias,
      child: onTap == null
          ? content
          : Semantics(
              button: true,
              label: semanticLabel,
              child: InkWell(onTap: onTap, child: content),
            ),
    );
  }
}
